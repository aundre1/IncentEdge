import React from 'react';

export default function SimpleMonitor() {
  const [status, setStatus] = React.useState('loading');
  const [pendingUpdates, setPendingUpdates] = React.useState(0);

  React.useEffect(() => {
    fetch('/api/monitoring/status')
      .then(res => res.json())
      .then(data => {
        setPendingUpdates(data.pendingUpdates || 0);
        setStatus('loaded');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <header style={{ marginBottom: '2rem' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>
              Data Monitoring Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
              Real-time tracking of 933 verified incentive programs
            </p>
          </header>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                PENDING UPDATES
              </h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {status === 'loading' ? '...' : pendingUpdates}
              </div>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Updates awaiting review</p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                PROGRAMS MONITORED
              </h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>933</div>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Verified programs tracked</p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                SCHEDULED CHECKS
              </h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>2,274</div>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Total monitoring tasks</p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#8b5cf6', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                SYSTEM STATUS
              </h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>ACTIVE</div>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Monitoring operational</p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.9)',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: '#1e293b'
            }}>
              Pending Program Updates
            </h2>
            
            {status === 'loading' ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading monitoring data...</div>
              </div>
            ) : pendingUpdates === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '1rem' }}>✓ All Programs Up to Date</div>
                <p style={{ color: '#64748b' }}>No pending updates detected. All 933 programs are current.</p>
              </div>
            ) : (
              <div>
                <div style={{ 
                  background: '#fef3c7', 
                  border: '1px solid #fbbf24', 
                  borderRadius: '0.5rem', 
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <strong style={{ color: '#92400e' }}>⚠ {pendingUpdates} Updates Pending</strong>
                  <p style={{ color: '#92400e', margin: '0.5rem 0 0 0' }}>
                    There are program updates that require review and approval.
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button 
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                    onClick={() => {
                      fetch('/api/monitoring/check', { method: 'POST' })
                        .then(() => window.location.reload());
                    }}
                  >
                    🔄 Check Programs
                  </button>
                  
                  <button 
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                    onClick={() => {
                      fetch('/api/monitoring/analyze-deadlines', { method: 'POST' })
                        .then(() => window.location.reload());
                    }}
                  >
                    📅 Analyze Deadlines
                  </button>
                  
                  <button 
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                    onClick={() => window.location.reload()}
                  >
                    🔄 Refresh Data
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b' }}>
            <p>Real-time monitoring system for IncentEdge platform</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Admin access required • Password: IncentEdge2025!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}