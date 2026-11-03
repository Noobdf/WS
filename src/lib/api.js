export async function request(path = '', options = {}) {
  let response;
  try {
    response = await fetch(`/api/filmes${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.message || 'Não foi possível concluir a operação.');
  return data;
}
