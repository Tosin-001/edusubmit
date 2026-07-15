export default function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="es-card bg-white p-3 p-md-4 h-100">
      <div className="text-muted small mb-1">{label}</div>
      <div className="fs-3 fw-bold">{value}</div>
    </div>
  );
}
