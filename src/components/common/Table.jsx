export default function Table({ columns = [], data = [] }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.accessor}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((c) => (
                <td key={c.key || c.accessor}>{c.render ? c.render(row) : row[c.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
