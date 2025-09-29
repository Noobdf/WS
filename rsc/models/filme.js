const mongoose = require("mongoose");

const Filme = mongoose.model("Filme", {
  titulo: {
    type: String,
    required: true,
  },
  atores: [String], // array de strings
  ano: Number,
  detalhes: {
    parametro1: String,
    parametro2: String,
  },
  premiacoes: [
    {
      titulo: String,
      ano: Number,
    },
  ],
});

module.exports = Filme;
