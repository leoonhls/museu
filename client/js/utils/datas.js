// Responsável: M5
const formatoData = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const formatoDataHora = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

// "2026-11-14" -> "14 de nov. de 2026" (o T00:00:00 evita o erro de fuso horário)
export function formatarData(textoData) {
  return formatoData.format(new Date(`${textoData}T00:00:00`));
}

// "2026-11-14T15:00:00" -> "14 de nov. de 2026, 15:00"
export function formatarDataHora(textoDataHora) {
  return formatoDataHora.format(new Date(textoDataHora));
}
