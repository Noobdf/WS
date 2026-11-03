import { connectDatabase } from '../../../lib/database.js';
import Filme from '../../../models/Filme.js';
import { apiHandler, readJson } from '../../../lib/http.js';
import { validateFilm } from '../../../lib/validation.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = apiHandler(async () => {
  await connectDatabase();
  const filmes = await Filme.find().sort({ createdAt: -1, _id: -1 }).lean();
  return Response.json({ error: false, filmes });
});

export const POST = apiHandler(async (request) => {
  const body = validateFilm(await readJson(request));
  await connectDatabase();
  const filme = await Filme.create(body);
  return Response.json({ error: false, filme }, {
    status: 201, headers: { Location: `/api/filmes/${filme.id}` },
  });
});
