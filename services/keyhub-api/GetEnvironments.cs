using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace KeyHub.Api;

/// <summary>
/// Restituisce l'elenco degli environment Business Central (es. TEST,
/// Production) su cui l'App Registration corrente ha realmente il consenso
/// applicativo, usato dal dashboard per popolare il selettore "Ambiente".
/// </summary>
public class GetEnvironments
{
    private static readonly HttpClient Http = new();

    private readonly ILogger<GetEnvironments> _logger;

    public GetEnvironments(ILogger<GetEnvironments> logger)
    {
        _logger = logger;
    }

    [Function("GetEnvironments")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "bc/environments")] HttpRequestData req)
    {
        var (tenantId, _, clientId, clientSecret) = BusinessCentralAuth.ReadConfig();

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

            // Admin API di Business Central: elenca tutti gli environment del
            // tenant a cui l'app registrata ha accesso a livello di token.
            const string url = "https://api.businesscentral.dynamics.com/admin/v2.19/applications/environments";

            using var bcRequest = new HttpRequestMessage(HttpMethod.Get, url);
            bcRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using var bcResponse = await Http.SendAsync(bcRequest);
            var bcBody = await bcResponse.Content.ReadAsStringAsync();

            if (!bcResponse.IsSuccessStatusCode)
            {
                _logger.LogError("Business Central Admin API ha risposto {StatusCode}: {Body}",
                    bcResponse.StatusCode, bcBody);
                var upstreamError = req.CreateResponse(HttpStatusCode.BadGateway);
                await upstreamError.WriteStringAsync("Errore nella chiamata alla Business Central Admin API.");
                return upstreamError;
            }

            // Solo gli environment elencati in BC_ALLOWED_ENVIRONMENTS (CSV,
            // case-insensitive) vengono restituiti al frontend: alcuni sandbox
            // possono rispondere 401 Authentication_InvalidCredentials se il
            // consenso applicativo non è stato concesso su quello specifico
            // environment, quindi non possiamo assumere che tutti quelli
            // elencati dall'Admin API siano davvero utilizzabili.
            var allowedEnvironments = ReadAllowedEnvironments();

            var environments = new List<object>();
            using (var document = JsonDocument.Parse(bcBody))
            {
                if (document.RootElement.TryGetProperty("value", out var valueElement) &&
                    valueElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in valueElement.EnumerateArray())
                    {
                        var name = item.TryGetProperty("name", out var nameEl) ? nameEl.GetString() : null;
                        var type = item.TryGetProperty("type", out var typeEl) ? typeEl.GetString() : null;

                        if (string.IsNullOrWhiteSpace(name))
                        {
                            continue;
                        }

                        if (!allowedEnvironments.Contains(name, StringComparer.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        environments.Add(new { name, type });
                    }
                }
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            await response.WriteStringAsync(JsonSerializer.Serialize(environments));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore durante il recupero degli environment da Business Central.");
            var response = req.CreateResponse(HttpStatusCode.InternalServerError);
            await response.WriteStringAsync("Errore interno durante il recupero degli environment.");
            return response;
        }
    }

    private static string[] ReadAllowedEnvironments()
    {
        var raw = Environment.GetEnvironmentVariable("BC_ALLOWED_ENVIRONMENTS");

        if (string.IsNullOrWhiteSpace(raw))
        {
            // Default ragionevole se la variabile non è impostata: TEST è
            // l'unico environment sandbox verificato finora in questo progetto.
            return new[] { "TEST", "Production" };
        }

        return raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }
}
