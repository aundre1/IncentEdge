import React from 'react';

function Monitor() {
  const [status, setStatus] = React.useState('loading');
  const [pendingUpdates, setPendingUpdates] = React.useState(0);
  const [updates, setUpdates] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/monitoring/status')
      .then(res => res.json())
      .then(data => {
        setPendingUpdates(data.pendingUpdates || 0);
        setUpdates(data.updates || []);
        setStatus('loaded');
      })
      .catch(() => setStatus('error'));
  }, []);

  const handleApplyUpdate = (updateId) => {
    fetch(`/api/monitoring/update/${updateId}/apply`, { method: 'POST' })
      .then(() => window.location.reload())
      .catch(err => console.error('Failed to apply update:', err));
  };

  const handleCheckPrograms = () => {
    fetch('/api/monitoring/check', { method: 'POST' })
      .then(() => window.location.reload())
      .catch(err => console.error('Failed to check programs:', err));
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '0.5rem',
      margin: 0
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1.1rem',
      margin: 0
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    card: {
      background: 'rgba(255,255,255,0.9)',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid rgba(0,0,0,0.1)'
    },
    cardTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      margin: '0 0 0.5rem 0'
    },
    cardValue: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      margin: '0 0 0.25rem 0'
    },
    cardDesc: {
      color: '#64748b',
      fontSize: '0.875rem',
      margin: 0
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap'
    },
    button: {
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: 'white'
    },
    updateCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1rem',
      background: '#f9fafb'
    },
    updateTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem',
      margin: '0 0 0.5rem 0'
    },
    updateMeta: {
      color: '#6b7280',
      fontSize: '0.875rem',
      margin: '0 0 1rem 0'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginBottom: '0.75rem'
    },
    changeRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap',
      marginBottom: '0.75rem'
    },
    changeLabel: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    oldValue: {
      padding: '0.5rem',
      background: '#fee2e2',
      color: '#991b1b',
      borderRadius: '0.25rem',
      fontSize: '0.875rem'
    },
    newValue: {
      padding: '0.5rem',
      background: '#dcfce7',
      color: '#166534',
      borderRadius: '0.25rem',
      fontSize: '0.875rem'
    },
    arrow: {
      fontSize: '1.25rem',
      color: '#6b7280'
    },
    sourceMeta: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      margin: 0
    },
    footer: {
      marginTop: '2rem',
      textAlign: 'center',
      color: '#64748b'
    },
    footerTitle: {
      margin: '0 0 0.5rem 0'
    },
    footerSubtitle: {
      fontSize: '0.875rem',
      margin: 0
    }
  };

  const getConfidenceStyle = (confidence) => {
    const base = { ...styles.badge };
    if (confidence === 'high') {
      return { ...base, background: '#dcfce7', color: '#166534' };
    } else if (confidence === 'medium') {
      return { ...base, background: '#fef3c7', color: '#92400e' };
    } else {
      return { ...base, background: '#fee2e2', color: '#991b1b' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        <header style={styles.header}>
          <h1 style={styles.title}>Data Monitoring Dashboard</h1>
          <p style={styles.subtitle}>Real-time tracking of 907 verified incentive programs</p>
        </header>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={{ ...styles.cardTitle, color: '#3b82f6' }}>PENDING UPDATES</h3>
            <div style={{ ...styles.cardValue, color: '#3b82f6' }}>
              {status === 'loading' ? '...' : pendingUpdates}
            </div>
            <p style={styles.cardDesc}>Updates awaiting review</p>
          </div>

          <div style={styles.card}>
            <h3 style={{ ...styles.cardTitle, color: '#10b981' }}>PROGRAMS MONITORED</h3>
            <div style={{ ...styles.cardValue, color: '#10b981' }}>907</div>
            <p style={styles.cardDesc}>Active verified programs</p>
          </div>

          <div style={styles.card}>
            <h3 style={{ ...styles.cardTitle, color: '#f59e0b' }}>SCHEDULED CHECKS</h3>
            <div style={{ ...styles.cardValue, color: '#f59e0b' }}>2,721</div>
            <p style={styles.cardDesc}>Total monitoring tasks</p>
          </div>

          <div style={styles.card}>
            <h3 style={{ ...styles.cardTitle, color: '#8b5cf6' }}>SYSTEM STATUS</h3>
            <div style={{ ...styles.cardValue, color: '#8b5cf6' }}>ACTIVE</div>
            <p style={styles.cardDesc}>Monitoring operational</p>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button
            style={{ ...styles.button, background: '#3b82f6' }}
            onClick={handleCheckPrograms}
          >
            🔄 Check Programs
          </button>
          <button
            style={{ ...styles.button, background: '#10b981' }}
            onClick={() => fetch('/api/monitoring/analyze-deadlines', { method: 'POST' }).then(() => window.location.reload())}
          >
            📅 Analyze Deadlines
          </button>
          <button
            style={{ ...styles.button, background: '#6b7280' }}
            onClick={() => window.location.reload()}
          >
            🔄 Refresh Data
          </button>
        </div>

        <div style={styles.card}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b', margin: '0 0 1rem 0' }}>
            Pending Program Updates
          </h2>

          {status === 'loading' ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading monitoring data...</div>
            </div>
          ) : pendingUpdates === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '1rem' }}>✅ All Programs Up to Date</div>
              <p style={{ color: '#64748b', margin: 0 }}>No pending updates detected. All 907 programs are current.</p>
            </div>
          ) : (
            <div>
              {updates.map((pendingUpdate) => (
                <div key={pendingUpdate.update.id} style={styles.updateCard}>
                  <h3 style={styles.updateTitle}>{pendingUpdate.program.name}</h3>
                  <p style={styles.updateMeta}>
                    {pendingUpdate.program.provider} • {pendingUpdate.program.amount}
                  </p>

                  <div style={getConfidenceStyle(pendingUpdate.update.confidence)}>
                    {pendingUpdate.update.confidence.toUpperCase()} CONFIDENCE
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ textTransform: 'capitalize', color: '#374151' }}>
                      {pendingUpdate.update.updateType} Change:
                    </strong>
                  </div>

                  <div style={styles.changeRow}>
                    <span style={styles.changeLabel}>FROM:</span>
                    <span style={styles.oldValue}>"{pendingUpdate.update.oldValue}"</span>
                    <span style={styles.arrow}>→</span>
                    <span style={styles.newValue}>"{pendingUpdate.update.newValue}"</span>
                  </div>

                  <p style={styles.sourceMeta}>
                    Source: {pendingUpdate.update.source} • 
                    Detected: {new Date(pendingUpdate.update.createdAt).toLocaleDateString()}
                  </p>

                  <button
                    onClick={() => handleApplyUpdate(pendingUpdate.update.id)}
                    style={{ ...styles.button, background: '#10b981' }}
                  >
                    ✅ Apply Update
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <p style={styles.footerTitle}>Real-time monitoring system for IncentEdge platform</p>
          <p style={styles.footerSubtitle}>Updated July 26, 2025 • 907 active programs tracked</p>
        </div>
      </div>
    </div>
  );
}

export default Monitor;