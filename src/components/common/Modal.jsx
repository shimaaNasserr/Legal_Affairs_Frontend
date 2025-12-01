export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.3)'}} onClick={onClose}>
      <div className="card" style={{maxWidth:600,margin:'10vh auto',padding:16}} onClick={(e)=>e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">{title}</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
