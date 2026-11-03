const form = document.querySelector('#film-form');
const list = document.querySelector('#film-list');
const feedback = document.querySelector('#feedback');
const saveButton = document.querySelector('#save');
const cancelButton = document.querySelector('#cancel');
const search = document.querySelector('#search');
const filter = document.querySelector('#filter');
const dialog = document.querySelector('#delete-dialog');
const retry = document.querySelector('#retry');
let filmes = [];
let editingId = null;
let deletingId = null;
let busy = false;

function message(text, error = false) {
  feedback.textContent = text;
  feedback.classList.toggle('error', error);
}
async function request(path = '', options = {}) {
  const response = await fetch(`/api/filmes${path}`, {
    ...options, headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.message || 'Não foi possível concluir a operação.');
  return data;
}
function element(tag, className, text) {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = text;
  return el;
}
function render() {
  const query = search.value.trim().toLocaleLowerCase('pt-BR');
  const visible = filmes.filter((f) => `${f.titulo} ${f.genero || ''}`.toLocaleLowerCase('pt-BR').includes(query)
    && (filter.value === 'all' || (filter.value === 'watched' ? f.assistido : !f.assistido)));
  document.querySelector('#count').textContent = filmes.length;
  list.replaceChildren();
  if (!visible.length) {
    const empty = element('div', 'empty', '');
    empty.append(element('strong', '', filmes.length ? 'Nenhum filme encontrado' : 'A próxima história é sua'));
    empty.append(element('span', '', filmes.length ? 'Experimente outra busca ou filtro.' : 'Adicione seu primeiro filme para começar a coleção.'));
    list.append(empty);
    return;
  }
  for (const filme of visible) {
    const card = element('article', 'film-card', '');
    const art = element('div', 'film-art', '');
    const initial = element('span', 'initial', filme.titulo.slice(0, 1).toUpperCase());
    initial.setAttribute('aria-hidden', 'true');
    art.append(initial, element('span', 'status', filme.assistido ? '✓ Já assisti' : '○ Quero assistir'));
    const content = element('div', 'film-content', '');
    content.append(element('h3', '', filme.titulo), element('p', 'meta', [filme.ano, filme.genero].filter(Boolean).join(' · ') || 'Sem detalhes'), element('p', 'synopsis', filme.sinopse || 'Uma nova história esperando por você.'));
    const actions = element('div', 'actions', '');
    for (const [action, label] of [['edit', 'Editar'], ['delete', 'Excluir']]) {
      const button = element('button', `secondary ${action}`, label);
      button.type = 'button';
      button.dataset.action = action;
      button.dataset.id = filme._id;
      button.setAttribute('aria-label', `${label} ${filme.titulo}`);
      button.disabled = busy;
      actions.append(button);
    }
    content.append(actions);
    card.append(art, content);
    list.append(card);
  }
}
function resetForm() {
  editingId = null;
  form.reset();
  document.querySelector('#form-title').textContent = 'Novo filme';
  saveButton.textContent = 'Adicionar à coleção';
  cancelButton.hidden = true;
}
function setBusy(value) {
  busy = value;
  for (const control of form.elements) control.disabled = value;
  for (const button of list.querySelectorAll('button')) button.disabled = value;
}
async function load() {
  list.setAttribute('aria-busy', 'true');
  retry.hidden = true;
  message('Carregando coleção…');
  try {
    filmes = (await request()).filmes;
    render();
    message('');
  } catch (error) {
    message(`Não foi possível carregar a coleção. ${error.message}`, true);
    retry.hidden = false;
  } finally { list.setAttribute('aria-busy', 'false'); }
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy) return;
  const titulo = form.elements.titulo.value.trim();
  if (!titulo) { message('Informe o título do filme.', true); form.elements.titulo.focus(); return; }
  const body = {
    titulo, genero: form.elements.genero.value.trim(), sinopse: form.elements.sinopse.value.trim(),
    assistido: form.elements.assistido.checked,
  };
  const year = form.elements.ano.value;
  body.ano = year ? Number(year) : null;
  const id = editingId;
  setBusy(true);
  try {
    const data = await request(id ? `/${id}` : '', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
    filmes = id ? filmes.map((f) => f._id === id ? data.filme : f) : [data.filme, ...filmes];
    resetForm(); render(); message(id ? 'Filme atualizado.' : 'Filme adicionado à coleção.');
  } catch (error) { message(error.message, true); }
  finally { setBusy(false); }
});
list.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || busy) return;
  const filme = filmes.find((f) => f._id === button.dataset.id);
  if (!filme) return;
  if (button.dataset.action === 'delete') {
    deletingId = filme._id;
    document.querySelector('#delete-description').textContent = `“${filme.titulo}” será removido da sua coleção.`;
    dialog.returnValue = '';
    dialog.showModal();
    return;
  }
  editingId = filme._id;
  for (const field of ['titulo', 'ano', 'genero', 'sinopse']) form.elements[field].value = filme[field] ?? '';
  form.elements.assistido.checked = Boolean(filme.assistido);
  document.querySelector('#form-title').textContent = 'Editar filme';
  saveButton.textContent = 'Salvar alterações';
  cancelButton.hidden = false;
  message('');
  form.elements.titulo.focus();
});
dialog.addEventListener('close', async () => {
  const id = deletingId;
  deletingId = null;
  if (dialog.returnValue !== 'confirm' || !id || busy) return;
  setBusy(true);
  try {
    await request(`/${id}`, { method: 'DELETE' });
    filmes = filmes.filter((f) => f._id !== id);
    if (editingId === id) resetForm();
    render(); message('Filme excluído.');
  } catch (error) { message(error.message, true); }
  finally { setBusy(false); }
});
cancelButton.addEventListener('click', () => { resetForm(); message(''); });
search.addEventListener('input', render);
filter.addEventListener('change', render);
retry.addEventListener('click', load);
load();
