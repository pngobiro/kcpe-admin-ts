export default function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="card">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Welcome to KCPE Admin</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage your courses, subjects, exam sets, and past papers from the sidebar.
          </p>
        </div>
      </div>
    </div>
  );
}
