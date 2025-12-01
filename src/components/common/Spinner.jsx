export default function Spinner({ text = "جاري التحميل..." }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="spinner-border" role="status" style={{width:"1.5rem", height:"1.5rem"}}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <span>{text}</span>
    </div>
  );
}
