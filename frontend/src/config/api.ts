// configuracao da API para o frontend
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api/v1',
  API_KEY: '2e9a0bc3-f3d3-414e-8443-fb059237efd5',
  TIMEOUT: 10000,
};

// headers padrao para todas as requisicoes
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
});