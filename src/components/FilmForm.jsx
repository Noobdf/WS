import { useEffect, useRef, useState } from 'react';

export default function FilmForm({ filme, busy, onSave, onCancel }) {
  const [values, setValues] = useState({ titulo: filme?.titulo || '', ano: filme?.ano ?? '', genero: filme?.genero || '', sinopse: filme?.sinopse || '', assistido: filme?.assistido || false });
  const titleRef = useRef(null);
  useEffect(() => { if (filme) titleRef.current?.focus(); }, [filme]);
  function change(event) {
    const { name, type, value, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (!values.titulo.trim()) {
      titleRef.current.setCustomValidity('Informe o título do filme.');
      titleRef.current.reportValidity();
      return;
    }
    await onSave({ ...values, titulo: values.titulo.trim(), genero: values.genero.trim(), sinopse: values.sinopse.trim(), ano: values.ano === '' ? null : Number(values.ano) });
  }
  return <aside className="panel">
    <p className="eyebrow">NA SUA LISTA</p><h2 id="form-title">{filme ? 'Editar filme' : 'Novo filme'}</h2>
    <form id="film-form" onSubmit={submit}>
      <label htmlFor="titulo">Título *</label><input ref={titleRef} id="titulo" name="titulo" required maxLength={150} placeholder="Qual é o próximo filme?" value={values.titulo} onChange={(event) => { event.target.setCustomValidity(''); change(event); }} disabled={busy} />
      <div className="form-row"><div><label htmlFor="ano">Ano</label><input id="ano" name="ano" type="number" min={1888} max={2100} placeholder="2025" value={values.ano} onChange={change} disabled={busy} /></div><div><label htmlFor="genero">Gênero</label><input id="genero" name="genero" maxLength={60} placeholder="Ex.: Drama" value={values.genero} onChange={change} disabled={busy} /></div></div>
      <label htmlFor="sinopse">Sinopse</label><textarea id="sinopse" name="sinopse" rows={4} maxLength={2000} placeholder="O que torna essa história especial?" value={values.sinopse} onChange={change} disabled={busy} />
      <label className="checkbox"><input id="assistido" name="assistido" type="checkbox" checked={values.assistido} onChange={change} disabled={busy} /> Já assisti a este filme</label>
      <button className="primary" type="submit" id="save" disabled={busy}>{busy ? 'Salvando…' : filme ? 'Salvar alterações' : 'Adicionar à coleção'}</button>
      {filme && <button className="secondary" id="cancel" type="button" onClick={onCancel} disabled={busy}>Cancelar edição</button>}
    </form>
  </aside>;
}
