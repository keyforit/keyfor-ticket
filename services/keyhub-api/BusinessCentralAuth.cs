using Azure.Core;
using Azure.Identity;

namespace KeyHub.Api;

/// <summary>
/// Helper condiviso per ottenere un token OAuth (client_credentials) per
/// Business Central, usato sia da GetModules che da GetCompanies.
/// Legge la configurazione da variabili d'ambiente (mai hardcoded).
/// </summary>
public static class BusinessCentralAuth
{
    private const string BusinessCentralScope = "https://api.businesscentral.dynamics.com/.default";

    public static (string? TenantId, string? Environment, string? ClientId, string? ClientSecret) ReadConfig()
    {
        var tenantId = System.Environment.GetEnvironmentVariable("BC_TENANT_ID");
        var environment = System.Environment.GetEnvironmentVariable("BC_ENVIRONMENT") ?? "Production";
        var clientId = System.Environment.GetEnvironmentVariable("BC_CLIENT_ID");
        var clientSecret = System.Environment.GetEnvironmentVariable("BC_CLIENT_SECRET");
        return (tenantId, environment, clientId, clientSecret);
    }

    public static async Task<string> GetAccessTokenAsync(string tenantId, string clientId, string clientSecret)
    {
        var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
        var token = await credential.GetTokenAsync(
            new TokenRequestContext(new[] { BusinessCentralScope }));
        return token.Token;
    }
}
