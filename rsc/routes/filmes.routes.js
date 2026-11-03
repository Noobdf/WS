const express = require('express');
const mongoose = require('mongoose');
const Filme = require('../models/filme');
const router = express.Router();
const fields = ['titulo', 'ano', 'genero', 'sinopse', 'assistido', 'atores', 'detalhes', 'premiacoes'];

function validate(req, res, next) {
  const body = req.body;
  const reject = (message) => res.status(400).json({ error: true, message });
  if (!body || Array.isArray(body) || typeof body !== 'object') return reject('Envie um objeto JSON.');
  if (!Object.keys(body).length) return reject('Informe os dados do filme.');
  if (Object.keys(body).some((key) => !fields.includes(key))) return reject('Há campos não permitidos.');
  if (typeof body.titulo !== 'string' || !body.titulo.trim() || body.titulo.trim().length > 150) {
    return reject('Título é obrigatório e deve ter até 150 caracteres.');
  }
  if (body.ano !== undefined && body.ano !== null && (!Number.isInteger(body.ano) || body.ano < 1888 || body.ano > 2100)) {
    return reject('Ano deve ser um número inteiro entre 1888 e 2100.');
  }
  for (const [field, limit] of [['genero', 60], ['sinopse', 2000]]) {
    if (body[field] !== undefined && (typeof body[field] !== 'string' || body[field].length > limit)) {
      return reject(`${field} deve ser um texto de até ${limit} caracteres.`);
    }
  }
  if (body.assistido !== undefined && typeof body.assistido !== 'boolean') return reject('Assistido deve ser true ou false.');
  if (body.atores !== undefined && (!Array.isArray(body.atores) || body.atores.length > 100 || body.atores.some((v) => typeof v !== 'string' || v.length > 150))) {
    return reject('Atores deve ser uma lista de até 100 nomes, com até 150 caracteres cada.');
  }
  if (body.detalhes !== undefined && (!body.detalhes || Array.isArray(body.detalhes) || typeof body.detalhes !== 'object' || Object.entries(body.detalhes).some(([k, v]) => !['parametro1', 'parametro2'].includes(k) || typeof v !== 'string' || v.length > 1000))) {
    return reject('Detalhes deve conter apenas parametro1 e parametro2 em texto.');
  }
  if (body.premiacoes !== undefined && (!Array.isArray(body.premiacoes) || body.premiacoes.length > 100 || body.premiacoes.some((v) => !v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).some((k) => !['titulo', 'ano'].includes(k)) || typeof v.titulo !== 'string' || !v.titulo.trim() || v.titulo.length > 150 || (v.ano !== undefined && (!Number.isInteger(v.ano) || v.ano < 1888 || v.ano > 2100))))) {
    return reject('Premiações deve ser uma lista de títulos e anos válidos.');
  }
  next();
}

router.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ error: true, message: 'ID inválido.' });
  next();
});

router.get('/', async (req, res) => {
  const filmes = await Filme.find().sort({ createdAt: -1, _id: -1 }).lean();
  res.json({ error: false, filmes });
});
router.get('/:id', async (req, res) => {
  const filme = await Filme.findById(req.params.id).lean();
  if (!filme) return res.status(404).json({ error: true, message: 'Filme não encontrado.' });
  res.json({ error: false, filme });
});
router.post('/', validate, async (req, res) => {
  const filme = await Filme.create(req.body);
  res.location(`/api/filmes/${filme.id}`).status(201).json({ error: false, filme });
});
router.put('/:id', validate, async (req, res) => {
  const filme = await Filme.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!filme) return res.status(404).json({ error: true, message: 'Filme não encontrado.' });
  res.json({ error: false, filme });
});
router.delete('/:id', async (req, res) => {
  const filme = await Filme.findByIdAndDelete(req.params.id);
  if (!filme) return res.status(404).json({ error: true, message: 'Filme não encontrado.' });
  res.status(204).end();
});
module.exports = router;
