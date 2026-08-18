# KEY HUB — Azure Functions Business Central

Tre Function espongono i dati di Business Central al frontend (`dashboard.html`):

- **`GetEnvironments`** (`GET /api/bc/environments`): elenco degli ambienti
  Business Central (es. `TEST`, `Production`) su cui l'App Registration
  corrente ha realmente il consenso applicativo, usato per popolare il
  selettore ambiente. Filtrato tramite `BC_ALLOWED_ENVIRONMENTS` (vedi sotto).
- **`GetCompanies`** (`GET /api/bc/companies?environment=...`): elenco delle
  aziende dell'ambiente indicato, usato per popolare il selettore azienda. Se
  `environment` non è passato in query string, usa `BC_ENVIRONMENT` come
  ambiente di default.
- **`GetModules`** (`GET /api/GetModules?companyId=...&environment=...`): legge
  dalla tabella `KeyHub Licensed Module` (tramite la pagina API custom
  `Page59003.KeyHubLicensedModulesAPI.al`) l'elenco dei moduli abilitati per
  l'azienda indicata, e li restituisce nel formato
  `[{ "name": "...", "active": true|false }, ...]`. Se `companyId` non è
  passato in query string, usa `BC_COMPANY_ID` come azienda di default; se
  `environment` non è passato, usa `BC_ENVIRONMENT`.

## Autenticazione: client secret (funziona anche sul piano Free)

A differenza di un primo tentativo con Managed Identity (che richiede il
piano **Standard**, non disponibile ora), questa Function usa un
**client secret** di un'App Registration Entra ID — funziona anche sul
piano **Free** della Static Web App.

## Variabili d'ambiente richieste

Da impostare su Azure Portal → la tua Static Web App → **Configurazione**
(Application settings), NON nel codice:

| Nome              | Descrizione                                                                 |
|-------------------|------------------------------------------------------------------------------|
| `BC_TENANT_ID`    | Tenant ID Entra ID (già noto: `a335d07d-8447-4a74-8ba9-ad5211bbc33d`)        |
| `BC_ENVIRONMENT`  | Nome ambiente Business Central di default (es. `TEST` in sandbox, poi `Production`), usato se il dashboard non passa `?environment=` |
| `BC_ALLOWED_ENVIRONMENTS` | CSV (case-insensitive) degli ambienti da mostrare nel selettore, es. `TEST,Production`. Se assente, default `TEST,Production`. Serve perché l'App Registration potrebbe non avere consenso applicativo su tutti gli ambienti elencati dalla Admin API — in quel caso BC risponde `401 Authentication_InvalidCredentials` per quell'ambiente specifico |
| `BC_COMPANY_ID`   | **GUID** della company di default (usato da `GetModules` se non arriva `companyId` in query) — vedi sotto come trovarlo |
| `BC_CLIENT_ID`    | Client ID dell'App Registration con permesso su Business Central API        |
| `BC_CLIENT_SECRET`| Client secret della stessa App Registration                                 |

Tutte e tre le Function (`GetEnvironments`, `GetCompanies` e `GetModules`)
condividono le stesse variabili — riusano l'autenticazione tramite
`BusinessCentralAuth.cs`.

## Chi può accedere a KEY HUB: `GetRoles` (assegnazione ruoli automatica)

- **`GetRoles`** (`POST /api/GetRoles`): funzione `rolesSource` (configurata
  in `staticwebapp.config.json` -> `auth.rolesSource`) richiamata
  automaticamente da Azure Static Web Apps dopo ogni login. Decide se
  assegnare il ruolo `utente` (richiesto da `/dashboard.html`) in base
  all'email di chi ha fatto login, **senza bisogno di inviti manuali** dalla
  sezione "Ruoli" del portale.

| Variabile              | Descrizione                                                                                     |
|------------------------|---------------------------------------------------------------------------------------------------|
| `ALLOWED_EMAIL_DOMAINS`| CSV (case-insensitive) dei domini email autorizzati, es. `keyfor.it`. Chiunque abbia una mail di questi domini ottiene automaticamente il ruolo `utente`. Se assente, default `keyfor.it` |
| `ALLOWED_EMAILS`       | CSV (case-insensitive) di indirizzi email singoli autorizzati come eccezione (es. consulenti esterni con mail personale/Gmail). Se assente, nessuna eccezione |

Con questo meccanismo non serve più generare "Collegamenti invito" a mano
dalla sezione Ruoli del portale Azure per il personale interno: basta che
l'email di dominio aziendale sia coperta da `ALLOWED_EMAIL_DOMAINS`. Per
persone esterne, aggiungere il loro indirizzo esatto a `ALLOWED_EMAILS`
(nessuna procedura di invito guest separata è necessaria: il provider di
login predefinito di Static Web Apps accetta account Microsoft personali,
la funzione `GetRoles` decide solo se concedere l'accesso in base alla
mail).

### Come trovare il GUID della company (`BC_COMPANY_ID`)

1. In Business Central, apri **Aziende** (Companies).
2. Apri la company (es. "CRONUS IT") e guarda l'URL nel browser: contiene un
   parametro `company=<GUID>` (a volte mostra il nome, ma l'API richiede il
   GUID — puoi ottenerlo anche chiamando
   `.../api/v2.0/companies` con lo stesso token e cercando la company per nome).

### Come creare/configurare l'App Registration per `BC_CLIENT_ID`/`BC_CLIENT_SECRET`

Puoi riusare l'App Registration **KeyHub-Auth** già creata per il login, oppure
crearne una dedicata (consigliato per separare i permessi):

1. Portale Azure → **Microsoft Entra ID** → **Registrazioni app** → (nuova o
   esistente "KeyHub-Auth").
2. **Autorizzazioni API** → **Aggiungi un'autorizzazione** → **Dynamics 365
   Business Central** → **Autorizzazioni applicazione** → seleziona
   `API.ReadWrite.All` (o l'autorizzazione più restrittiva disponibile per la
   tua API custom).
3. Clicca **Concedi consenso amministratore** (serve un ruolo Global
   Admin/Privileged Role Admin).
4. **Certificati e segreti** → crea un nuovo **client secret**, copialo subito
   (non sarà più visibile dopo).
5. Copia anche il **Client ID** dell'app.
6. Inserisci `BC_CLIENT_ID` e `BC_CLIENT_SECRET` nelle Application Settings
   della Static Web App.

## Endpoint Business Central chiamati

```
GET https://api.businesscentral.dynamics.com/admin/v2.19/applications/environments
GET https://api.businesscentral.dynamics.com/v2.0/{tenant}/{environment}/api/v2.0/companies
GET https://api.businesscentral.dynamics.com/v2.0/{tenant}/{environment}/api/keyfor/keyhub/v1.0/companies({companyId})/licensedModules
```

Il terzo è definito da `business-central/src/Page59003.KeyHubLicensedModulesAPI.al`.
