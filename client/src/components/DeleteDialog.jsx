import { useEffect, useRef } from 'react';

export default function DeleteDialog({ filme, onConfirm, onCancel }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (filme) { dialog.current.returnValue = ''; dialog.current.showModal(); }
    else if (dialog.current.open) dialog.current.close();
  }, [filme]);
  return <dialog id="delete-dialog" ref={dialog} aria-labelledby="delete-title" aria-describedby="delete-description" onClose={() => {
    if (!filme) return;
    if (dialog.current.returnValue === 'confirm') onConfirm(filme);
    else onCancel();
  }}>
    <h2 id="delete-title">Excluir filme?</h2><p id="delete-description">{filme ? `“${filme.titulo}” será removido da sua coleção.` : ''}</p>
    <form method="dialog"><button className="secondary" value="cancel" autoFocus>Cancelar</button><button className="danger" value="confirm">Excluir filme</button></form>
  </dialog>;
}
