function notFound() {
  return Response.json({ error: true, message: 'Rota não encontrada.' }, { status: 404 });
}
export { notFound as GET, notFound as POST, notFound as PUT, notFound as DELETE, notFound as PATCH };
