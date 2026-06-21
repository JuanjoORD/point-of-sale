import { TopProducto } from '../types/reports.types';

function escapeCsvValue(value: string | number): string {
  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildTableCsv(title: string, rows: TopProducto[]): string {
  const header = 'ranking,producto,cantidad_vendida,total_vendido';
  const body = rows.map((row, index) =>
    [
      index + 1,
      escapeCsvValue(row.nombre_producto),
      row.cantidad_vendida,
      row.total_vendido,
    ].join(','),
  );
  return [title, header, ...body, ''].join('\n');
}

export function downloadTopProductosCsv(
  cantidad: TopProducto[],
  valor: TopProducto[],
  fechaInicio: string,
  fechaFin: string,
): void {
  const content = [
    buildTableCsv('Top por cantidad', cantidad),
    buildTableCsv('Top por valor', valor),
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `top_productos_${fechaInicio}_${fechaFin}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
