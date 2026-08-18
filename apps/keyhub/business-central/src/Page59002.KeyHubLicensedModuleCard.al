// ⚠️ ID nel range 50000-59999 assegnato alla tua azienda (confermato dal
// file app.json dell'estensione "Custom Data Layer" già in uso). Prima di
// pubblicare, verifica comunque che 59002 non sia già occupato da un'altra
// estensione installata (Impostazioni → Intervalli ID oggetto).
page 59002 "KeyHub Licensed Module Card"
{
    Caption = 'KEY HUB Licensed Module';
    PageType = Card;
    SourceTable = "KeyHub Licensed Module";
    ApplicationArea = All;
    Editable = true;

    layout
    {
        area(Content)
        {
            group(General)
            {
                Caption = 'Generale';

                field("Module Code"; Rec."Module Code")
                {
                    ApplicationArea = All;
                    ToolTip = 'Codice univoco del modulo, usato dall''integrazione KEY HUB / KEY TICKET.';
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Descrizione/traduzione visualizzata del modulo.';
                }
                field(Active; Rec.Active)
                {
                    ApplicationArea = All;
                    ToolTip = 'Indica se il modulo è attivo e quindi abilitato lato KEY HUB.';
                }
            }
        }
    }
}
