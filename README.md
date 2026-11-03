# API de filmes

API de estudo em desenvolvimento com Node.js, Express e MongoDB. O projeto pratica rotas HTTP, recebimento de JSON e persistência com Mongoose.

## Tecnologias

Node.js, Express, Mongoose, MongoDB, Morgan e body-parser.

## Requisitos e execução local

Tenha Node.js com npm e MongoDB instalados. O código usa o banco local `mongodb://localhost:27017/netflix` e a porta `3000`.

```sh
git clone https://github.com/Noobdf/WS.git
cd WS
npm install
node index.js
```

Inicie o MongoDB antes de executar a aplicação. O comando direto com `node` evita depender de uma instalação global de `nodemon`, que é usado pelo script `npm start`, mas ainda não está declarado no projeto.

## Rotas

| Método | Caminho | Estado atual |
| --- | --- | --- |
| GET | `/` | Lista os filmes do banco. |
| POST | `/` | Cadastra um filme. |
| GET | `/:id` | Retorna uma mensagem de exemplo; consulta por ID pendente. |
| PUT | `/:id` | Retorna uma mensagem de exemplo; atualização pendente. |
| DELETE | `/:id` | Retorna uma mensagem de exemplo; exclusão pendente. |

### Cadastrar um filme

Envie uma requisição `POST` para `http://localhost:3000/`, com o cabeçalho `Content-Type: application/json` e um corpo como:

```json
{
  "titulo": "Filme de exemplo",
  "atores": ["Pessoa A", "Pessoa B"],
  "ano": 2025,
  "detalhes": {
    "parametro1": "Detalhe A",
    "parametro2": "Detalhe B"
  },
  "premiacoes": [
    { "titulo": "Prêmio de exemplo", "ano": 2025 }
  ]
}
```

O campo `titulo` é obrigatório no modelo atual. Para consultar a lista, envie `GET` para `http://localhost:3000/`.

## Estrutura

- `index.js`: configuração do servidor e conexão com MongoDB.
- `rsc/routes/filmes.routes.js`: rotas HTTP.
- `rsc/models/filme.js`: modelo de dados.
- `package.json`: dependências e comandos.

## Próximos passos

- [ ] Implementar consulta por ID, atualização e exclusão.
- [ ] Padronizar os códigos HTTP e o tratamento de erros.
- [ ] Configurar conexão e porta por variáveis de ambiente.
- [ ] Ajustar os scripts de execução.
- [ ] Retirar `node_modules` do versionamento e adicionar `.gitignore`.
- [ ] Implementar testes das rotas; o script de teste atual é apenas um placeholder.

## Autor

[Gileno Oliveira](https://github.com/Noobdf)
