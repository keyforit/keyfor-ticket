using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace KeyHub.Api;

public class GetModules
{
    // Riutilizzato tra le invocazioni: HttpClient è thread-safe e costoso
    // da ricreare ad ogni chiamata.
    private static readonly HttpClient Http = new();

    private readonly ILogger<GetModules> _logger;

    public GetModules(ILogger<GetModules> logger)
    {
        _logger = logger;
    }

    [Function("GetModules")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
    {
        var (tenantId, defaultEnvironment, clientId, clientSecret) = BusinessCentralAuth.ReadConfig();

        // La company puo' arrivare dal dashboard (?companyId=...), scelta
        // dall'utente tramite il selettore azienda popolato da GetCompanies;
        // se assente, si usa BC_COMPANY_ID come valore di default (es. CRONUS IT
        // in sandbox). Stesso discorso per l'environment (?environment=...).
        var companyId = System.Web.HttpUtility.ParseQueryString(req.Url.Query)["companyId"]
            ?? Environment.GetEnvironmentVariable("BC_COMPANY_ID");
        var environment = System.Web.HttpUtility.ParseQueryString(req.Url.Query)["environment"]
            ?? defaultEnvironment;

        if (string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(companyId) ||
            string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
        {
            _logger.LogError("BC_TENANT_ID, companyId (query o BC_COMPANY_ID), BC_CLIENT_ID o BC_CLIENT_SECRET non configurati.");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync("Configurazione Business Central mancante.");
            return errorResponse;
        }

        try
        {
            // 1. Ottieni un token per Business Central con client secret (funziona
            //    anche sul piano Free della Static Web App: non serve una Managed
            //    Identity/Standard SKU per questo).
            var accessToken = await BusinessCentralAuth.GetAccessTokenAsync(tenantId, clientId, clientSecret);

            // 2. Chiama la pagina API custom "KeyHub Licensed Modules API"
            //    (business-central/src/Page59003.KeyHubLicensedModulesAPI.al)
            //    che espone la tabella "KeyHub Licensed Module".
            var url = $"https://api.businesscentral.dynamics.com/v2.0/{tenantId}/{environment}" +
                      $"/api/keyfor/keyhub/v1.0/companies({companyId})/licensedModules";

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

            // 3. Business Central restituisce { "value": [ { moduleCode, description,
            //    active, ... }, ... ] }. Il frontend (dashboard.html) si aspetta invece
            //    un array semplice [{ name, active }], quindi mappiamo i campi.
            var modules = new List<object>();
            using (var document = JsonDocument.Parse(bcBody))
            {
                if (document.RootElement.TryGetProperty("value", out var valueElement) &&
                    valueElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in valueElement.EnumerateArray())
                    {
                        var moduleCode = item.TryGetProperty("moduleCode", out var codeEl)
                            ? codeEl.GetString()
                            : null;
                        var active = item.TryGetProperty("active", out var activeEl) &&
                            activeEl.ValueKind == JsonValueKind.True;

                        modules.Add(new { name = moduleCode, active });
                    }
                }
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            await response.WriteStringAsync(JsonSerializer.Serialize(modules));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore durante il recupero dei moduli licenziati da Business Central.");
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteStringAsync("Errore interno durante il recupero dei moduli.");
            return response;
        }
    }
}

