// ⚠️ ID nel range 50000-59999 assegnato alla tua azienda (confermato dal
// file app.json dell'estensione "Custom Data Layer" già in uso). Prima di
// pubblicare, verifica comunque che 59003 non sia già occupato da un'altra
// estensione installata (Impostazioni → Intervalli ID oggetto).
//
// Pagina API: espone la tabella "KeyHub Licensed Module" come endpoint REST
// che la Function GetModules (in ../api/GetModules.cs) chiama per leggere
// i moduli abilitati per KEY HUB / KEY TICKET.
//
// Endpoint risultante (dopo pubblicazione):
//   GET https://api.businesscentral.dynamics.com/v2.0/{tenant}/{environment}
//       /api/keyfor/keyhub/v1.0/companies({companyId})/licensedModules
page 59003 "KeyHub Licensed Modules API"
{
    PageType = API;
    APIPublisher = 'keyfor';
    APIGroup = 'keyhub';
    APIVersion = 'v1.0';
    EntityName = 'licensedModule';
    EntitySetName = 'licensedModules';
    SourceTable = "KeyHub Licensed Module";
    DelayedInsert = true;
    ODataKeyFields = SystemId;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(id; Rec.SystemId)
                {
                    Caption = 'Id';
                    Editable = false;
                }
                field(moduleCode; Rec."Module Code")
                {
                    Caption = 'Module Code';
                }
                field(description; Rec.Description)
                {
                    Caption = 'Description';
                }
                field(active; Rec.Active)
                {
                    Caption = 'Active';
                }
                field(lastModifiedDateTime; Rec.SystemModifiedAt)
                {
                    Caption = 'Last Modified Date Time';
                    Editable = false;
                }
            }
        }
    }
}
