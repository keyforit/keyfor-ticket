# KeyFor Monorepo

Monorepo che contiene:

- `apps/keyhub`: portale contenitore (shell web)
- `apps/keyticket`: modulo ticketing React/Vite
- `services/keyhub-api`: Azure Functions usate da KeyHub

## Struttura

```text
apps/
  keyhub/
  keyticket/
services/
  keyhub-api/
```

## Sviluppo

- KeyTicket:
  - `npm run keyticket:dev`
  - `npm run keyticket:build`
- API KeyHub:
  - da `services/keyhub-api` usare i comandi .NET/Azure Functions già previsti dal progetto

## Note

Le integrazioni con Business Central devono restare consistenti:
- chiamate "API page" (es. user tree) su endpoint dedicati
- chiamate OData (es. creazione ticket) su endpoint dedicati
- autenticazione centralizzata via backend/infrastruttura Azure
