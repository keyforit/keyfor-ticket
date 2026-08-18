# KeyHub Integration — Estensione Business Central

Estensione AL che espone in Business Central la configurazione dei moduli
licenziati per l'integrazione con KEY HUB / KEY TICKET.

## Contenuto

- **Tabella `KeyHub Licensed Module` (ID 59000)**: tre campi — `Module Code`
  (codice del modulo), `Description` (traduzione/etichetta visualizzata),
  `Active` (flag per abilitare/disabilitare il modulo). È una tabella
  **condivisa** (`DataPerCompany = false`): la configurazione vale per tutto
  l'ambiente, non va duplicata per ogni company.
- **Pagina lista `KeyHub Licensed Modules` (ID 59001)**: elenco editabile per
  gestire i moduli configurati.
- **Pagina scheda `KeyHub Licensed Module Card` (ID 59002)**: scheda per il
  singolo modulo, aperta cliccando/aprendo una riga dalla lista (pattern
  standard Lista + Scheda di Business Central).

## ⚠️ Prima di pubblicare

Gli ID oggetto (**59000–59049**, definiti in `app.json` come `idRanges`)
sono stati scelti dentro il range **50000–59999** già assegnato alla tua
azienda (confermato dall'estensione "Custom Data Layer" già in uso).
Prima di pubblicare, verifica comunque che 59000/59001 non siano già
occupati:

1. Business Central → **Impostazioni** → **Intervalli ID oggetto** (o
   controlla gli ID usati nelle altre estensioni AL della tua azienda, es.
   "Custom Data Layer").
2. Se già occupati, aggiorna `idRanges` in `app.json` e i numeri oggetto
   (`table 59000`, `page 59001`) su un altro ID libero nel range
   50000–59999.

## Configurare `.vscode/launch.json` (ambiente Sandbox)

Il file `.vscode/launch.json` è già configurato con i valori reali del
tenant KEY HUB:

- **Ambiente**: `TEST` (visibile in alto a sinistra in Business Central)
- **Tenant ID**: `a335d07d-8447-4a74-8ba9-ad5211bbc33d`

Se in futuro cambi ambiente/tenant, aggiorna questi due valori in
`.vscode/launch.json`.

## Come compilare

Serve **AL Language extension** per VS Code (Microsoft) e un file di
configurazione del server/ambiente (`launch.json`), che varia in base a come
è ospitato il tuo Business Central (SaaS, on-premise, container Docker).

1. Apri questa cartella (`business-central/`) in VS Code
2. Installa l'estensione **AL Language** (marketplace Microsoft)
3. `Ctrl+Shift+P` → **AL: Download symbols** (richiede connessione
   all'ambiente Business Central di destinazione)
4. `Ctrl+Shift+P` → **AL: Package** per generare il file `.app`, oppure
   **AL: Publish** per pubblicare direttamente su un ambiente di sviluppo/sandbox

## Come useremo questi dati

La Function `GetModules` (in `../api/GetModules.cs`) leggerà da questa
tabella tramite l'API standard di Business Central (`LicensedModules` /
endpoint OData personalizzato da esporre in seguito), restituendo al
frontend KEY HUB l'elenco `{ name, active }` per abilitare/disabilitare
funzionalità come KEY TICKET.
