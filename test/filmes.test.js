const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Filme = require('../rsc/models/filme');
let mongo;
let server;
let base;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
beforeEach(async () => { await Filme.deleteMany({}); });

async function request(method, path = '', body) {
  return fetch(`${base}/api/filmes${path}`, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test('CRUD completo: criar, listar, buscar, editar, persistir e excluir', async () => {
  let response = await request('POST', '', { titulo: '  Interestelar  ', ano: 2014, genero: 'Ficção', assistido: false });
  assert.equal(response.status, 201);
  let filme = (await response.json()).filme;
  const id = filme._id;
  assert.equal(filme.titulo, 'Interestelar');
  assert.equal(response.headers.get('location'), `/api/filmes/${id}`);
  response = await request('GET');
  assert.equal((await response.json()).filmes.length, 1);
  response = await request('GET', `/${id}`);
  assert.equal((await response.json()).filme.ano, 2014);
  response = await request('PUT', `/${id}`, { titulo: 'Interestelar (revisto)', assistido: true, ano: null });
  assert.equal(response.status, 200);
  filme = (await response.json()).filme;
  assert.equal(filme.assistido, true);
  assert.equal(filme.genero, 'Ficção');
  assert.equal(filme.ano, null);
  assert.equal((await Filme.findById(id)).titulo, 'Interestelar (revisto)');
  response = await request('DELETE', `/${id}`);
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
  assert.equal(await Filme.countDocuments(), 0);
  assert.equal((await request('GET', `/${id}`)).status, 404);
});

test('rejeita títulos vazios, tipos inválidos e campos não permitidos sem gravar', async () => {
  for (const body of [{}, { titulo: '  ' }, { titulo: 123 }, { titulo: 'x', ano: '2020' },
    { titulo: 'x', ano: 1800 }, { titulo: 'x', assistido: 'false' }, { titulo: 'x', $set: { titulo: 'y' } },
    { titulo: 'x', atores: [42] }, { titulo: 'x', detalhes: { extra: 'x' } },
    { titulo: 'x', premiacoes: [{ titulo: 'Prêmio', ano: '2025' }] }, { titulo: 'x', sinopse: 'a'.repeat(2001) }]) {
    assert.equal((await request('POST', '', body)).status, 400, JSON.stringify(body));
  }
  assert.equal(await Filme.countDocuments(), 0);
});

test('valida também na edição e mantém o registro quando a alteração é inválida', async () => {
  const filme = await Filme.create({ titulo: 'Original', ano: 2000 });
  assert.equal((await request('PUT', `/${filme.id}`, { titulo: '', ano: 2001 })).status, 400);
  assert.equal((await Filme.findById(filme.id)).titulo, 'Original');
});

test('distingue IDs inválidos de registros inexistentes', async () => {
  for (const method of ['GET', 'PUT', 'DELETE']) {
    const body = method === 'PUT' ? { titulo: 'Teste' } : undefined;
    assert.equal((await request(method, '/invalido', body)).status, 400);
    assert.equal((await request(method, '/000000000000000000000000', body)).status, 404);
  }
});

test('aceita campos do modelo anterior e preserva dados extras ao editar pela interface', async () => {
  const response = await request('POST', '', { titulo: 'Clássico', atores: ['Pessoa A'], detalhes: { parametro1: 'A' }, premiacoes: [{ titulo: 'Prêmio', ano: 2000 }] });
  assert.equal(response.status, 201);
  const { filme } = await response.json();
  const edited = await request('PUT', `/${filme._id}`, { titulo: 'Clássico editado' });
  assert.deepEqual((await edited.json()).filme.atores, ['Pessoa A']);
});

test('responde JSON para erros e disponibiliza a interface', async () => {
  const malformed = await fetch(`${base}/api/filmes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).message, 'JSON inválido.');
  const missing = await fetch(`${base}/api/inexistente`);
  assert.equal(missing.status, 404);
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /CineLista/);
});
