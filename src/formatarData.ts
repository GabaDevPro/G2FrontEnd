// Converte "2026-10-01" em "01/10/2026".
// Separar o texto evita o fuso horário: new Date('2026-10-01') é meia-noite
// em UTC, que no Brasil ainda é 30/09.
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-')

  return `${dia}/${mes}/${ano}`
}
