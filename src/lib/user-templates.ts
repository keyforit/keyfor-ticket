/**
 * Tipi e parser per i dati restituiti dalla query BC
 * GET /api/ticket/usersCompleteTree?email=...
 *
 * La query ritorna righe piatte (una per campo template).
 * Questo modulo le raggruppa in strutture usabili dall'UI.
 */

export interface TemplateField {
  fieldName: string
  fieldType: string
  mandatory: boolean
  linkToBcTable: string | null
  linkToBcTableMandatory: boolean
}

export interface RequestTemplate {
  code: string
  description: string
  groupCode: string
  notesEnabled: boolean
  attachmentsEnabled: boolean
  informationalText: string
  fields: TemplateField[]
}

/** Riga grezza restituita dalla query BC (nomi OData) */
interface BcRow {
  entra_e_mail?: string
  entra_id?: string
  template_header_code?: string
  description?: string
  group_code?: string
  notes_enabled?: boolean
  attachments_nabled?: boolean   // typo intenzionale nel BC
  informational_text?: string
  field_name?: string
  field_type?: string
  mandatory?: boolean
  link_to_bc_table?: string
  link_to_bc_table_mandatory?: boolean
  field_active?: boolean
}

/**
 * Converte le righe piatte di BC in un array di RequestTemplate,
 * raggruppando per template_header_code.
 * Righe senza template (LEFT JOIN vuoto) vengono ignorate.
 */
export function parseTemplatesFromBcRows(rows: BcRow[]): RequestTemplate[] {
  const map = new Map<string, RequestTemplate>()

  for (const row of rows) {
    const code = row.template_header_code
    if (!code) continue

    if (!map.has(code)) {
      map.set(code, {
        code,
        description: row.description ?? code,
        groupCode: row.group_code ?? '',
        notesEnabled: Boolean(row.notes_enabled),
        attachmentsEnabled: Boolean(row.attachments_nabled),
        informationalText: row.informational_text ?? '',
        fields: [],
      })
    }

    // Aggiunge il campo solo se presente e attivo
    if (row.field_name && row.field_active !== false) {
      const template = map.get(code)!
      const alreadyAdded = template.fields.some((f) => f.fieldName === row.field_name)
      if (!alreadyAdded) {
        template.fields.push({
          fieldName: row.field_name,
          fieldType: row.field_type ?? 'Text',
          mandatory: Boolean(row.mandatory),
          linkToBcTable: row.link_to_bc_table ?? null,
          linkToBcTableMandatory: Boolean(row.link_to_bc_table_mandatory),
        })
      }
    }
  }

  return Array.from(map.values())
}

/**
 * Restituisce i gruppi distinti presenti nei template,
 * utili per costruire i tab di categoria.
 */
export function getTemplateGroups(templates: RequestTemplate[]): string[] {
  const seen = new Set<string>()
  const groups: string[] = []
  for (const t of templates) {
    const g = t.groupCode || 'Altro'
    if (!seen.has(g)) { seen.add(g); groups.push(g) }
  }
  return groups
}
