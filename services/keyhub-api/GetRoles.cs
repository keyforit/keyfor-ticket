using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace KeyHub.Api;

/// <summary>
/// Funzione "rolesSource" richiamata automaticamente da Azure Static Web Apps
/// dopo ogni login, per decidere quali ruoli assegnare all'utente autenticato
/// (vedi staticwebapp.config.json -&gt; auth.rolesSource). Sostituisce il
/// sistema di inviti manuali "utente per utente": l'accesso viene concesso
/// in automatico in base al dominio email (es. tutti gli @keyfor.it) e/o a
/// una lista puntuale di eccezioni per singoli indirizzi esterni.
/// </summary>
public class GetRoles
{
    private readonly ILogger<GetRoles> _logger;

    public GetRoles(ILogger<GetRoles> logger)
    {
        _logger = logger;
    }

    [Function("GetRoles")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "GetRoles")] HttpRequestData req)
    {
        var body = await req.ReadAsStringAsync();
        var response = req.CreateResponse(HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "application/json");

        if (string.IsNullOrWhiteSpace(body))
        {
            await response.WriteStringAsync(JsonSerializer.Serialize(new { roles = Array.Empty<string>() }));
            return response;
        }

        try
        {
            var payload = JsonSerializer.Deserialize<RolesRequest>(body,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            // Per il provider Azure Active Directory, "userDetails" contiene
            // l'indirizzo email (UPN) di chi ha fatto login.
            var email = payload?.UserDetails?.Trim() ?? string.Empty;

            var roles = new List<string>();

            if (!string.IsNullOrWhiteSpace(email) && IsAllowed(email))
            {
                roles.Add("utente");
            }
            else
            {
                _logger.LogInformation("Accesso non concesso a {Email}: dominio/indirizzo non in whitelist.", email);
            }

            await response.WriteStringAsync(JsonSerializer.Serialize(new { roles }));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore durante la valutazione dei ruoli utente.");
            await response.WriteStringAsync(JsonSerializer.Serialize(new { roles = Array.Empty<string>() }));
            return response;
        }
    }

    /// <summary>
    /// Un indirizzo è autorizzato se il suo dominio è in
    /// ALLOWED_EMAIL_DOMAINS (CSV, es. "keyfor.it,altrodominio.com") oppure
    /// se l'indirizzo esatto è in ALLOWED_EMAILS (CSV, per eccezioni singole
    /// come consulenti esterni con mail personale). Entrambi i controlli
    /// sono case-insensitive.
    /// </summary>
    private static bool IsAllowed(string email)
    {
        var allowedDomains = ReadCsvEnv("ALLOWED_EMAIL_DOMAINS", new[] { "keyfor.it" });
        var allowedEmails = ReadCsvEnv("ALLOWED_EMAILS", Array.Empty<string>());

        if (allowedEmails.Any(allowed => string.Equals(allowed, email, StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        var atIndex = email.LastIndexOf('@');
        if (atIndex < 0 || atIndex == email.Length - 1)
        {
            return false;
        }

        var domain = email[(atIndex + 1)..];
        return allowedDomains.Any(allowed => string.Equals(allowed, domain, StringComparison.OrdinalIgnoreCase));
    }

    private static string[] ReadCsvEnv(string name, string[] fallback)
    {
        var raw = Environment.GetEnvironmentVariable(name);
        if (string.IsNullOrWhiteSpace(raw))
        {
            return fallback;
        }

        return raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    private sealed class RolesRequest
    {
        [JsonPropertyName("identityProvider")]
        public string? IdentityProvider { get; set; }

        [JsonPropertyName("userId")]
        public string? UserId { get; set; }

        [JsonPropertyName("userDetails")]
        public string? UserDetails { get; set; }

        [JsonPropertyName("claims")]
        public List<RoleClaim>? Claims { get; set; }
    }

    private sealed class RoleClaim
    {
        [JsonPropertyName("typ")]
        public string? Type { get; set; }

        [JsonPropertyName("val")]
        public string? Value { get; set; }
    }
}
