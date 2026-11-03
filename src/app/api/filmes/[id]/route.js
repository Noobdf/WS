import mongoose from 'mongoose';
import { connectDatabase } from '../../../../lib/database.js';
import Filme from '../../../../models/Filme.js';
import { ApiError, apiHandler, readJson } from '../../../../lib/http.js';
import { validateFilm } from '../../../../lib/validation.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getId(context) {
  const { id } = await context.params;
  if (!mongoose.isObjectIdOrHexString(id)) throw new ApiError(400, 'ID inválido.');
  return id;
}
function requireFilm(filme) {
  if (!filme) throw new ApiError(404, 'Filme não encontrado.');
  return filme;
}
export const GET = apiHandler(async (request, context) => {
  const id = await getId(context);
  await connectDatabase();
  const filme = requireFilm(await Filme.findById(id).lean());
  return Response.json({ error: false, filme });
});
export const PUT = apiHandler(async (request, context) => {
  const id = await getId(context);
  const body = validateFilm(await readJson(request));
  await connectDatabase();
  const filme = requireFilm(await Filme.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true }));
  return Response.json({ error: false, filme });
});
export const DELETE = apiHandler(async (request, context) => {
  const id = await getId(context);
  await connectDatabase();
  requireFilm(await Filme.findByIdAndDelete(id));
  return new Response(null, { status: 204 });
});
