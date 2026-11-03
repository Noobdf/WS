export default function FilmCard({ filme, busy, onEdit, onDelete }) {
  return <article className="film-card">
    <div className="film-art">
      <span className="initial" aria-hidden="true">{filme.titulo.slice(0, 1).toUpperCase()}</span>
      <span className="status">{filme.assistido ? '✓ Já assisti' : '○ Quero assistir'}</span>
    </div>
    <div className="film-content">
      <h3>{filme.titulo}</h3>
      <p className="meta">{[filme.ano, filme.genero].filter(Boolean).join(' · ') || 'Sem detalhes'}</p>
      <p className="synopsis">{filme.sinopse || 'Uma nova história esperando por você.'}</p>
      <div className="actions">
        <button type="button" className="secondary edit" aria-label={`Editar ${filme.titulo}`} disabled={busy} onClick={() => onEdit(filme)}>Editar</button>
        <button type="button" className="secondary delete" aria-label={`Excluir ${filme.titulo}`} disabled={busy} onClick={() => onDelete(filme)}>Excluir</button>
      </div>
    </div>
  </article>;
}
