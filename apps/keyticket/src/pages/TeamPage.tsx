export function TeamPage() {
  const members = [
    { name: 'Marco Rossi', role: 'Agente Senior', avatar: 'MR', open: 2, resolved: 12 },
    { name: 'Laura Conti', role: 'Agente', avatar: 'LC', open: 1, resolved: 8 },
    { name: 'Andrea Ferri', role: 'Sviluppatore', avatar: 'AF', open: 1, resolved: 5 },
    { name: 'Sara Mancini', role: 'Support Manager', avatar: 'SM', open: 0, resolved: 20 },
  ]

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-[#EDEBE9] pb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#605E5C]">Dashboard / Team</p>
        <h1 className="mt-2 text-3xl font-light leading-tight text-[#323130]">Team</h1>
        <p className="mt-1 text-sm leading-5 text-[#605E5C]">Panoramica dei membri del team di supporto.</p>
      </div>

      <div className="mt-4 border-b border-[#EDEBE9] bg-white px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="border border-[#EDEBE9] px-3 py-1.5 text-sm text-[#323130] hover:bg-[#F3F2F1]">
            + Nuovo
          </button>
          <button type="button" className="border border-[#EDEBE9] px-3 py-1.5 text-sm text-[#323130] hover:bg-[#F3F2F1]">
            Filtra
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-[#FAF9F8]">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#605E5C]">Nome</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#605E5C]">Ruolo</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#605E5C]">Ticket Aperti</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#605E5C]">Ticket Risolti</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={member.name} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FCFBFA]'}>
                <td className="px-6 py-3">
                  <div className="font-medium text-[#323130]">{member.name}</div>
                  <div className="mt-1 text-xs text-[#605E5C]">{member.avatar}</div>
                </td>
                <td className="px-6 py-3 text-[#605E5C]">{member.role}</td>
                <td className="px-6 py-3 text-[#323130]">{member.open}</td>
                <td className="px-6 py-3 text-[#323130]">{member.resolved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
