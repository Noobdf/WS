import mongoose from 'mongoose';

// O cache global evita abrir outra conexão a cada atualização no desenvolvimento.
const cache = globalThis.cinelistaDatabase ??= { connection: null, promise: null };

export async function connectDatabase() {
  if (cache.connection) return cache.connection;
  if (!cache.promise) {
    cache.promise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/catalogo_filmes', {
      serverSelectionTimeoutMS: 5000,
    });
  }
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}
