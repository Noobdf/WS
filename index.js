const mongoose = require('mongoose');
const app = require('./app');

async function start() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um número entre 1 e 65535.');
  }
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/catalogo_filmes', {
    serverSelectionTimeoutMS: 5000,
  });
  const server = app.listen(port, () => console.log(`Catálogo disponível em http://localhost:${port}`));
  server.on('error', async (error) => {
    console.error('Não foi possível abrir o servidor:', error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(async () => { await mongoose.disconnect(); });
    });
  }
}

start().catch((error) => {
  console.error('Não foi possível iniciar. Confira o MongoDB e o arquivo .env:', error.message);
  process.exitCode = 1;
});
