const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true, maxlength: 150 },
  ano: { type: Number, min: 1888, max: 2100 },
  genero: { type: String, trim: true, maxlength: 60, default: '' },
  sinopse: { type: String, trim: true, maxlength: 2000, default: '' },
  assistido: { type: Boolean, default: false },
  atores: [{ type: String, trim: true, maxlength: 150 }],
  detalhes: { parametro1: String, parametro2: String },
  premiacoes: [{ titulo: String, ano: Number }],
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Filme', schema);
