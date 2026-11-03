'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../lib/api.js';
import FilmForm from './FilmForm.jsx';
import FilmCard from './FilmCard.jsx';
import DeleteDialog from './DeleteDialog.jsx';

export default function CineLista() {
  const [filmes, setFilmes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState({ text: '', error: false });
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const mutation = useRef(false);
  const loadController = useRef(null);
  const message = (text, error = false) => setNotice({ text, error });
  const load = useCallback(async () => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    setLoading(true); setLoadError(false);
    setNotice({ text: 'Carregando coleção…', error: false });
    try {
      const data = await request('', { signal: controller.signal });
      if (controller.signal.aborted) return;
      setFilmes(data.filmes); setNotice({ text: '', error: false });
    } catch (error) {
      if (controller.signal.aborted) return;
      setLoadError(true); setNotice({ text: error.message, error: true });
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => { load(); return () => loadController.current?.abort(); }, [load]);
  function resetForm() { setEditing(null); setFormVersion((value) => value + 1); }
  async function save(body) {
    if (mutation.current) return;
    mutation.current = true; setBusy(true);
    const id = editing?._id;
    try {
      const { filme } = await request(id ? `/${id}` : '', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
      setFilmes((current) => id ? current.map((item) => item._id === id ? filme : item) : [filme, ...current]);
      resetForm(); message(id ? 'Filme atualizado.' : 'Filme adicionado à coleção.');
    } catch (error) { message(error.message, true); }
    finally { mutation.current = false; setBusy(false); }
  }
  async function remove(filme) {
    setDeleting(null);
    if (mutation.current) return;
    mutation.current = true; setBusy(true);
    try {
      await request(`/${filme._id}`, { method: 'DELETE' });
      setFilmes((current) => current.filter((item) => item._id !== filme._id));
      if (editing?._id === filme._id) resetForm();
      message('Filme excluído.');
    } catch (error) { message(error.message, true); }
    finally { mutation.current = false; setBusy(false); }
  }
  const query = search.trim().toLocaleLowerCase('pt-BR');
  const visible = filmes.filter((filme) => `${filme.titulo} ${filme.genero || ''}`.toLocaleLowerCase('pt-BR').includes(query)
    && (filter === 'all' || (filter === 'watched' ? filme.assistido : !filme.assistido)));
  return <>
    <header className="topbar"><a className="brand" href="/">◉ CineLista<span>SEU PRÓXIMO PLAY COMEÇA AQUI</span></a><span className="signature">Um projeto de Gileno Oliveira</span></header>
    <main>
      <section className="hero"><p className="eyebrow">SUA COLEÇÃO, SEU ROTEIRO</p><h1>Boas histórias.<br /><span>Sempre por perto.</span></h1><p>Guarde descobertas, organize sua lista e encontre o filme da próxima sessão.</p><a className="primary" href="#titulo">+ Adicionar filme</a></section>
      <section className="workspace" aria-label="Catálogo de filmes">
        <FilmForm key={`${editing?._id || 'new'}:${formVersion}`} filme={editing} busy={busy || loading || loadError} onSave={save} onCancel={() => { resetForm(); message(''); }} />
        <div className="collection">
          <div className="collection-heading"><div><p className="eyebrow">SEU ACERVO</p><h2>Minha coleção <span id="count">{filmes.length}</span></h2></div></div>
          <div className="toolbar"><div><label className="sr-only" htmlFor="search">Buscar por título ou gênero</label><input type="search" id="search" placeholder="Buscar por título ou gênero…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div><label className="sr-only" htmlFor="filter">Filtrar por status</label><select id="filter" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Todos os filmes</option><option value="pending">Quero assistir</option><option value="watched">Já assisti</option></select></div></div>
          <p id="feedback" className={notice.error ? 'error' : ''} role="status" aria-live="polite">{notice.text}</p>
          {loadError && <button className="secondary" id="retry" type="button" onClick={load}>Tentar novamente</button>}
          <div id="film-list" className="film-list" aria-busy={loading}>
            {!loading && !loadError && !visible.length && <div className="empty"><strong>{filmes.length ? 'Nenhum filme encontrado' : 'A próxima história é sua'}</strong><span>{filmes.length ? 'Experimente outra busca ou filtro.' : 'Adicione seu primeiro filme para começar a coleção.'}</span></div>}
            {visible.map((filme) => <FilmCard key={filme._id} filme={filme} busy={busy} onEdit={(item) => { setEditing(item); message(''); }} onDelete={setDeleting} />)}
          </div>
        </div>
      </section>
    </main>
    <footer>CineLista · Feito para colecionar histórias. <a href="https://github.com/Noobdf/WS">Ver código no GitHub ↗</a></footer>
    <DeleteDialog filme={deleting} onConfirm={remove} onCancel={() => setDeleting(null)} />
  </>;
}
