export default function FormInput({ label, name, value, onChange, type="text", ...rest }) {
  return (
    <div>
      {label && <label className="form-label" htmlFor={name}>{label}</label>}
      <input id={name} name={name} type={type} value={value} onChange={onChange} className="form-control" {...rest} />
    </div>
  );
}
