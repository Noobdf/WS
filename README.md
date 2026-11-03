# CineLista

Catálogo de filmes construído com **React, Next.js e MongoDB**. Organize os filmes que quer assistir, registre os que já viu e encontre sua próxima sessão.

Projeto de estudo e portfólio de [Gileno Oliveira](https://github.com/Noobdf).

![Interface do CineLista com formulário de cadastro e coleção de filmes](docs/cinelista.png)

## O que a aplicação faz

Permite cadastrar, listar, consultar, editar e excluir filmes. Cada registro pode ter título, ano, gênero, sinopse e indicação de assistido.

A interface combina busca por título ou gênero com filtros de status, confirma exclusões e informa carregamento, coleção vazia ou falha de conexão. Os dados são validados no servidor e persistidos em MongoDB.

## Estrutura React com Next.js

A aplicação usa o App Router do Next.js. A página e o layout são componentes React. A coleção, o formulário e os cartões usam estado e eventos do React. As operações com o banco ficam nas rotas de servidor do mesmo projeto.

```text
src/
  app/
    layout.jsx                 Layout e metadados
    page.jsx                   Página principal em React
    globals.css                Estilos responsivos
    api/
      filmes/
        route.js               Listagem e cadastro
        [id]/route.js          Consulta, edição e exclusão
      [...path]/route.js       Resposta para rotas de API inexistentes
  components/
    CineLista.jsx              Estado da coleção, busca e filtros
    FilmForm.jsx               Formulário controlado em React
    FilmCard.jsx               Cartão de filme
    DeleteDialog.jsx           Confirmação de exclusão
  lib/
    api.js                     Chamadas HTTP da interface
    database.js                Conexão reutilizável com MongoDB
    http.js                    Leitura de JSON e tratamento de erros
    validation.js              Validação dos dados recebidos
  models/
    Filme.js                   Modelo Mongoose
test/
  filmes.test.mjs              Testes HTTP do CRUD
  helpers/server.mjs          Inicialização do Next.js para testes
next.config.mjs               Configuração da aplicação
```

**Tecnologias:** React 19, Next.js 16, JavaScript, CSS, MongoDB e Mongoose. Node.js executa o Next.js no servidor.

## Executar localmente

Tenha Node.js 22.12 ou superior e MongoDB local em execução, ou uma conexão MongoDB Atlas.

```sh
git clone https://github.com/Noobdf/WS.git
cd WS
npm ci
```

Copie `.env.example` para `.env.local`.

No PowerShell:

```powershell
Copy-Item .env.example .env.local
```

No Linux ou macOS:

```sh
cp .env.example .env.local
```

Configure a conexão:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/catalogo_filmes
```

Inicie a aplicação inteira com um comando:

```sh
npm run dev
```

Abra **http://localhost:3000**. A interface React e as rotas da API são atendidas pelo Next.js. Não é necessário iniciar outro servidor para a API.

O Next.js carrega `.env.local` automaticamente. A conexão com MongoDB é aberta quando uma rota precisa acessar os dados. O arquivo de ambiente fica fora do versionamento.

## Versão de produção

```sh
npm run build
npm start
```

O primeiro comando compila a aplicação. O segundo inicia o Next.js em produção. A pasta `.next` é gerada localmente e ignorada pelo Git.

## API

| Método | Rota | Resultado |
| --- | --- | --- |
| GET | `/api/filmes` | Lista os filmes mais recentes primeiro. |
| GET | `/api/filmes/:id` | Consulta um filme. |
| POST | `/api/filmes` | Cadastra um filme e retorna status 201. |
| PUT | `/api/filmes/:id` | Atualiza os campos enviados, com título obrigatório. |
| DELETE | `/api/filmes/:id` | Exclui um filme e retorna status 204 sem corpo. |

Para cadastrar ou editar, envie `Content-Type: application/json` e um objeto como:

```json
{
  "titulo": "Interestelar",
  "ano": 2014,
  "genero": "Ficção científica",
  "sinopse": "Uma viagem além dos limites conhecidos.",
  "assistido": false
}
```

O cadastro retorna `{ "error": false, "filme": { ... } }`, com os dados do filme, `_id`, `createdAt` e `updatedAt`. A listagem retorna `{ "error": false, "filmes": [ ... ] }`.

O título deve ter entre 1 e 150 caracteres depois de remover espaços das pontas. Ano aceita um inteiro entre 1888 e 2100, ou `null` para limpar o valor. Gênero aceita até 60 caracteres; sinopse, até 2000. O campo `assistido` recebe apenas booleano.

Os campos anteriores `atores`, `detalhes` e `premiacoes` continuam disponíveis pela API e são preservados quando omitidos na edição. Campos desconhecidos e operadores de atualização enviados pelo cliente são rejeitados.

Os erros retornam `{ "error": true, "message": "Descrição do erro" }`. A aplicação usa 400 para entrada ou ID inválido, 404 para filme ou rota inexistente, 413 para corpo acima de 100 KB, 415 para um tipo de conteúdo diferente de JSON e 500 para falha interna. Métodos não suportados recebem a resposta 405 do Next.js.

## Testes

```sh
npm test
```

O comando compila o Next.js e inicia uma instância da aplicação para testes HTTP com um MongoDB temporário isolado. Na primeira execução, é necessário acesso à internet para baixar o binário do MongoDB usado por `mongodb-memory-server`.

Os sete testes cobrem o CRUD completo, persistência, validação no cadastro e na edição, IDs inválidos, registros inexistentes, preservação de campos anteriores, entrega da página React, JSON malformado, limite de tamanho e tipo de conteúdo.

O banco de testes é temporário e não usa a conexão pessoal configurada no arquivo de ambiente. O GitHub Actions executa o mesmo comando em cada atualização.

## Decisões e próximos passos

A coleção usa IDs do MongoDB, permitindo filmes com títulos iguais. A conexão é reutilizada no servidor, inclusive durante atualizações no desenvolvimento. Busca e filtros funcionam juntos na interface; paginação e busca no servidor são melhorias previstas para coleções maiores.

O catálogo é compartilhado e ainda não possui contas de usuário. Autenticação e autorização são próximos passos antes de oferecer coleções privadas.

O banco padrão é `catalogo_filmes`. Para reutilizar os dados da primeira versão, configure `MONGODB_URI=mongodb://127.0.0.1:27017/netflix` no arquivo de ambiente.
