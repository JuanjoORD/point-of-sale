import { ReactNode } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

export interface DataTableColumn<T> {
  id: string;
  label: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  title: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  canCreate?: boolean;
  createLabel?: string;
  onCreate?: () => void;
  renderActions?: (row: T) => ReactNode;
}

function DataTable<T>({
  title,
  columns,
  rows,
  rowKey,
  canCreate = false,
  createLabel = 'Nuevo',
  onCreate,
  renderActions,
}: DataTableProps<T>) {
  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        {canCreate && onCreate && (
          <Button variant="contained" onClick={onCreate}>
            {createLabel}
          </Button>
        )}
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align ?? 'left'}>
                  {col.label}
                </TableCell>
              ))}
              {renderActions && <TableCell align="right">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)} hover>
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align ?? 'left'}>
                    {col.render(row)}
                  </TableCell>
                ))}
                {renderActions && <TableCell align="right">{renderActions(row)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default DataTable;
