// ⚠️ ID nel range 50000-59999 assegnato alla tua azienda (confermato dal
// file app.json dell'estensione "Custom Data Layer" già in uso). Prima di
// pubblicare, verifica comunque che 59000 non sia già occupato da un'altra
// estensione installata (Impostazioni → Intervalli ID oggetto).
table 59000 "KeyHub Licensed Module"
{
    Caption = 'KEY HUB Licensed Module';
    DataClassification = CustomerContent;

    // Tabella condivisa (shared): la configurazione dei moduli licenziati
    // è unica per l'intero ambiente/tenant, non va duplicata per ogni company.
    DataPerCompany = false;

    fields
    {
        field(1; "Module Code"; Code[20])
        {
            Caption = 'Module Code';
            DataClassification = CustomerContent;
            NotBlank = true;
        }
        field(2; "Description"; Text[100])
        {
            Caption = 'Description';
            DataClassification = CustomerContent;
        }
        field(3; "Active"; Boolean)
        {
            Caption = 'Active';
            DataClassification = CustomerContent;
        }
    }

    keys
    {
        key(PK; "Module Code")
        {
            Clustered = true;
        }
    }
}
