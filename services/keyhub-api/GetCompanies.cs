using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace KeyHub.Api;

/// <summary>
/// Restituisce l'elenco delle aziende (companies) del tenant Business Central,
/// usato dal dashboard per popolare il selettore azienda.
/// </summary>
public class GetCompanies
{
    private static readonly HttpClient Http = new();

    private readonly ILogger<GetCompanies> _logger;

    public GetCompanies(ILogger<GetCompanies> logger)
    {
        _logger = logger;
    }

    [Function("GetCompanies")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "bc/companies")] HttpRequestData req)
    {
        var (tenantId, defaultEnvironment, clientId, clientSecret) = BusinessCentralAuth.ReadConfig();

        // L'environment puo' arrivare dal dashboard (?environment=...), scelto
        // dall'utente tramite il selettore ambiente popolato da GetEnvironments;
        // se assente, si usa BC_ENVIRONMENT come valore di default.
        var environment = System.Web.HttpUtility.ParseQueryString(req.Url.Query)["environment"]
            ?? defaultEnvironment;

        if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(clientId) ||
            string.IsNullOrWhiteSpace(clientSecret))
        {
            _logger.LogError("BC_TENANT_ID, BC_CLIENT_ID o BC_CLIENT_SECRET non configurati.");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("Configurazione Business Central mancante.");
            return errorResponse;
        }

        try
        {
            var accessToken = await BusinessCentralAuth.GetAccessTokenAsync(tenantId, clientId, clientSecret);

            // Endpoint standard di Business Central per l'elenco aziende.
            var url = $"https://api.businesscentral.dynamics.com/v2.0/{tenantId}/{environment}/api/v2.0/companies";

            using var bcRequest = new HttpRequestMessage(HttpMethod.Get, url);
            bcRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using var bcResponse = await Http.SendAsync(bcRequest);
            var bcBody = await bcResponse.Content.ReadAsStringAsync();

            if (!bcResponse.IsSuccessStatusCode)
            {
                _logger.LogError("Business Central ha risposto {StatusCode}: {Body}",
                    bcResponse.StatusCode, bcBody);
                var upstreamError = req.CreateResponse(HttpStatusCode.BadGateway);
                await upstreamError.WriteStringAsync("Errore nella chiamata a Business Central.");
                return upstreamError;
            }

            // BC restituisce { "value": [ { id, name, displayName, ... }, ... ] }.
            // Semplifichiamo per il frontend a [{ id, name }, ...].
            var companies = new List<object>();
            using (var document = JsonDocument.Parse(bcBody))
            {
                if (document.RootElement.TryGetProperty("value", out var valueElement) &&
                    valueElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in valueElement.EnumerateArray())
                    {
                        var id = item.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;

                        // displayName può esistere ma essere una stringa vuota: in quel caso
                        // ripieghiamo comunque su "name" (il nome interno, es. "CRONUS IT").
                        string? displayName = item.TryGetProperty("displayName", out var nameEl) ? nameEl.GetString() : null;
                        string? altName = item.TryGetProperty("name", out var altNameEl) ? altNameEl.GetString() : null;
                        var name = !string.IsNullOrWhiteSpace(displayName) ? displayName : altName;

                        companies.Add(new { id, name });
                    }
                }
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            await response.WriteStringAsync(JsonSerializer.Serialize(companies));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore durante il recupero dell'elenco aziende da Business Central.");
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteStringAsync("Errore interno durante il recupero delle aziende.");
            return response;
        }
    }
}
