const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use('/admin', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  ws: true,
}));

app.use('/', createProxyMiddleware({  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true,
}));

app.listen(4000, () => {
  console.log('Proxy running on http://localhost:4000');
});