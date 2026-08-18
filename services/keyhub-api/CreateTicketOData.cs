using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace KeyHub.Api;

public class CreateTicketOData
{
    private static readonly HttpClient Http = new();
    private readonly ILogger<CreateTicketOData> _logger;

    public CreateTicketOData(ILogger<CreateTicketOData> logger)
    {
        _logger = logger;
    }

    [Function("CreateTicketOData")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "ticket/createOData")] HttpRequestData req)
    {
        var (configTenantId, defaultEnvironment, clientId, clientSecret) = BusinessCentralAuth.ReadConfig();

        if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
        {
            var errorResp = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResp.WriteStringAsync("{\"error\": \"Configurazione BC mancante\"}");
            return errorResp;
        }

        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        using var jsonDocument = JsonDocument.Parse(requestBody);
        var root = jsonDocument.RootElement;
        
        string tenantId = root.TryGetProperty("tenantId", out var tProp) ? tProp.GetString() ?? configTenantId : configTenantId;
        string environment = "TEST"; // Come richiesto per i ticket, oppure si puo usare defaultEnvironment se preferito

        try
        {
            string token = await BusinessCentralAuth.GetAccessTokenAsync(tenantId, clientId, clientSecret);

            var bcUrl = $"https://api.businesscentral.dynamics.com/v2.0/{tenantId}/{environment}/ODataV4/TicketWebService";

            // Rimuoviamo il tenantId dal payload da mandare a BC
            var payload = new
            {
                templateHeaderCode = root.TryGetProperty("templateHeaderCode", out var thc) ? (object)thc : null,
                fields = root.TryGetProperty("fields", out var f) ? (object)f : null,
                notes = root.TryGetProperty("notes", out var n) ? (object)n : null
            };

            var bcRequest = new HttpRequestMessage(HttpMethod.Post, bcUrl)
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), System.Text.Encoding.UTF8, "application/json")
            };
            bcRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var bcResponse = await Http.SendAsync(bcRequest);
            var content = await bcResponse.Content.ReadAsStringAsync();

            var response = req.CreateResponse(bcResponse.StatusCode);
            response.Headers.Add("Content-Type", "application/json");
            await response.WriteStringAsync(content);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore chiamata BC per creazione ticket");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync($"{{\"error\": \"{ex.Message}\"}}");
            return errorResponse;
        }
    }
}
