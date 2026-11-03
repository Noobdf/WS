export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function apiHandler(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) return Response.json({ error: true, message: error.message }, { status: error.status });
      if (['ValidationError', 'CastError'].includes(error.name)) {
        return Response.json({ error: true, message: 'Dados do filme inválidos.' }, { status: 400 });
      }
      console.error('Erro na API de filmes:', error);
      return Response.json({ error: true, message: 'Não foi possível concluir a operação.' }, { status: 500 });
    }
  };
}

export async function readJson(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new ApiError(415, 'Envie os dados com Content-Type: application/json.');
  }
  if (!request.body) throw new ApiError(400, 'Envie um objeto JSON.');
  const reader = request.body.getReader();
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 100 * 1024) {
        await reader.cancel();
        throw new ApiError(413, 'Corpo da requisição muito grande.');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { throw new ApiError(400, 'JSON inválido.'); }
}
