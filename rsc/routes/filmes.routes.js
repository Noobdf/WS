const express = require('express')
const router = express.Router()
const Filme = require('../models/filme')

// RECUPERAR TODOS OS REGISTROS
router.get('/', async (req, res) => {
    try {
        const filmes = await Filme.find({})
        res.json({ error: false, filmes } )
    } catch(err){
        res.json({ mensagem: 'PEGAR TODOS OS REGISTROS'});
    }
    
});

// PEGAR SOMENTE OS REGISTRO COM O ID
router.get('/:id', (req, res) => {
    const id = req.params.id;
    res.json({ mensagem: `PEGAR SOMENTE OS REGISTRO COM O ID: ${id}`});
})

// CRIAR UM REGISTRO
router.post('/', async (req, res) => {
    try {
        const filme = req.body;
        const response = await new Filme(filme).save();
        res.send({ error: false, filme: response });
    } catch (err){
        res.json({ error: true, message: err.message  });
    }
});

// recuperar SOMENTE OS REGISTRO COM O ID
router.put('/:id', (req, res) => {
    const id = req.params.id;
    res.json({ mensagem: `recuperar SOMENTE OS REGISTRO COM O ID: ${id}`});
})

// DELETAR SOMENTE O REGISTRO COM O ID
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    res.json({ mensagem: `DELETAR SOMENTE O REGISTRO COM O ID: ${id}`});
})


module.exports = router;