const express = require('express');
const path = require('node:path');
const routes = require('./rsc/routes/filmes.routes');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use('/api/filmes', routes);
app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => res.status(404).json({ error: true, message: 'Rota não encontrada.' }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: true, message: 'JSON inválido.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: true, message: 'Corpo da requisição muito grande.' });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: true, message: 'Dados do filme inválidos.' });
  }
  console.error(err);
  res.status(500).json({ error: true, message: 'Não foi possível concluir a operação.' });
});
module.exports = app;
