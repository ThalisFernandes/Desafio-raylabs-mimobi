import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Product } from '../types';
import { productService } from '../services/api';
import ProductCard from '../components/Products/ProductCard';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // buscar produtos na inicializacao
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAll();
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (err) {
        setError('Erro ao carregar produtos. Verifique se o backend está rodando.');
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // aplicar filtros e busca
  useEffect(() => {
    let filtered = [...products];

    // filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // filtro por categoria
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // ordenacao
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'stock':
          return b.stock - a.stock;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, sortBy]);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  // extrair categorias unicas dos produtos
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Produtos Disponíveis
      </Typography>

      {/* filtros e busca */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flexGrow: 1 }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={categoryFilter}
              label="Categoria"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              label="Ordenar por"
              onChange={handleSortChange}
            >
              <MenuItem value="name">Nome</MenuItem>
              <MenuItem value="price_asc">Menor Preço</MenuItem>
              <MenuItem value="price_desc">Maior Preço</MenuItem>
              <MenuItem value="stock">Estoque</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* indicadores de filtros ativos */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {searchTerm && (
            <Chip
              label={`Busca: "${searchTerm}"`}
              onDelete={() => setSearchTerm('')}
              color="primary"
              variant="outlined"
            />
          )}
          {categoryFilter && (
            <Chip
              label={`Categoria: ${categoryFilter}`}
              onDelete={() => setCategoryFilter('')}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {/* resultados */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {filteredProducts.length} produto(s) encontrado(s)
        </Typography>
      </Box>

      {filteredProducts.length === 0 ? (
        <Alert severity="info">
          Nenhum produto encontrado com os filtros aplicados.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProductsPage;