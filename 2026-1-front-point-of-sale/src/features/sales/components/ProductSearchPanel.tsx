import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Producto } from '@/features/inventory/types/inventory.types';
import { useProductSearch } from '../hooks/useProductSearch';
import { inventarioApi } from '../services/inventario.service';
import { useCartStore } from '../store/cartStore';

const formatMoney = (value: number): string =>
  new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

interface ProductSearchPanelProps {
  onFeedback: (message: string, severity: 'success' | 'error') => void;
}

function ProductSearchPanel({ onFeedback }: ProductSearchPanelProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  const { data: results = [], isLoading, isFetching } = useProductSearch(query);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = async (product: Producto) => {
    try {
      const stock = product.es_servicio
        ? null
        : await inventarioApi.getTotalStock(product.id_producto);
      const result = addItem(product, stock);
      if (result.ok) {
        onFeedback(`"${product.nombre_producto}" agregado al carrito.`, 'success');
        setQuery('');
        inputRef.current?.focus();
      } else {
        onFeedback(result.error ?? 'No se pudo agregar el producto.', 'error');
      }
    } catch {
      onFeedback('Error al consultar stock del producto.', 'error');
    }
  };

  const showResults = query.trim().length >= 1;

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Buscar producto
      </Typography>

      <TextField
        inputRef={inputRef}
        label="Nombre o codigo de barras"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setQuery('');
            return;
          }
          if (e.key === 'Enter' && results.length > 0 && !isLoading && !isFetching) {
            e.preventDefault();
            handleAdd(results[0]);
          }
        }}
        fullWidth
        autoComplete="off"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Enter agrega el primer resultado · Esc limpia la busqueda
      </Typography>

      {showResults && (
        <Box mt={2}>
          {(isLoading || isFetching) && (
            <Box className="flex justify-center py-4">
              <CircularProgress size={28} />
            </Box>
          )}

          {!isLoading && !isFetching && results.length === 0 && (
            <Alert severity="info">No se encontraron productos.</Alert>
          )}

          {!isLoading && !isFetching && results.length > 0 && (
            <List disablePadding>
              {results.map((product) => (
                <ListItem
                  key={product.id_producto}
                  disablePadding
                  secondaryAction={
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddShoppingCartIcon />}
                      onClick={() => handleAdd(product)}
                    >
                      Agregar
                    </Button>
                  }
                >
                  <ListItemButton onClick={() => handleAdd(product)}>
                    <ListItemText
                      primary={product.nombre_producto}
                      secondary={
                        <>
                          {product.codigo_barras ? `Cod: ${product.codigo_barras} · ` : ''}
                          Q {formatMoney(product.precio_venta)}
                          {product.es_servicio ? ' · Servicio' : ''}
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}
    </Paper>
  );
}

export default ProductSearchPanel;
