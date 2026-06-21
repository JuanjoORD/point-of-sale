import { VentasRangoResponse } from '../types/reports.types';

export function downloadVentasRangoCsv(data: VentasRangoResponse): void {
  const header = 'fecha_inicio,fecha_fin,total_ventas,cantidad_tickets,ticket_promedio';
  const row = [
    data.fecha_inicio,
    data.fecha_fin,
    data.total_ventas,
    data.cantidad_tickets,
    data.ticket_promedio,
  ].join(',');

  const blob = new Blob([`${header}\n${row}\n`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ventas_${data.fecha_inicio}_${data.fecha_fin}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
