import React from 'react';

export default function MonitoringPage() {
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
      .then(() => {
        window.location.reload();
      })
      .catch(err => console.error('Failed to apply update:', err));
  };

  const handleCheckPrograms = () => {
    fetch('/api/monitoring/check', { method: 'POST' })
      .then(() => {
        window.location.reload();
      })
      .catch(err => console.error('Failed to check programs:', err));
  };

  const handleAnalyzeDeadlines = () => {
    fetch('/api/monitoring/analyze-deadlines', { method: 'POST' })
      .then(() => {
        window.location.reload();
      })
      .catch(err => console.error('Failed to analyze deadlines:', err));
  };

  return (
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
            Real-time tracking of 907 verified incentive programs
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
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>907</div>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Active verified programs</p>
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
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>2,721</div>
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

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button 
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={handleCheckPrograms}
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
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={handleAnalyzeDeadlines}
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
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={() => window.location.reload()}
          >
            🔄 Refresh Data
          </button>
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
              <div style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '1rem' }}>✅ All Programs Up to Date</div>
              <p style={{ color: '#64748b' }}>No pending updates detected. All 907 programs are current.</p>
            </div>
          ) : (
            <div style={{ space: '1.5rem' }}>
              {updates.map((pendingUpdate, index) => (
                <div key={pendingUpdate.update.id} style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  background: '#f9fafb'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                      {pendingUpdate.program.name}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {pendingUpdate.program.provider} • {pendingUpdate.program.amount}
                    </p>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                      display: 'inline-block',
                      background: pendingUpdate.update.confidence === 'high' ? '#dcfce7' : 
                                 pendingUpdate.update.confidence === 'medium' ? '#fef3c7' : '#fee2e2',
                      color: pendingUpdate.update.confidence === 'high' ? '#166534' : 
                             pendingUpdate.update.confidence === 'medium' ? '#92400e' : '#991b1b',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem'
                    }}>
                      {pendingUpdate.update.confidence.toUpperCase()} CONFIDENCE
                    </div>
                    
                    <div style={{ marginBottom: '0.75rem' }}>
                      <strong style={{ textTransform: 'capitalize', color: '#374151' }}>
                        {pendingUpdate.update.updateType} Change:
                      </strong>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>FROM:</span>
                      <span style={{ 
                        padding: '0.5rem', 
                        background: '#fee2e2', 
                        color: '#991b1b', 
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem'
                      }}>
                        "{pendingUpdate.update.oldValue}"
                      </span>
                      <span style={{ fontSize: '1.25rem', color: '#6b7280' }}>→</span>
                      <span style={{ 
                        padding: '0.5rem', 
                        background: '#dcfce7', 
                        color: '#166534', 
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem'
                      }}>
                        "{pendingUpdate.update.newValue}"
                      </span>
                    </div>
                    
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                      Source: {pendingUpdate.update.source} • 
                      Detected: {new Date(pendingUpdate.update.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleApplyUpdate(pendingUpdate.update.id)}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    ✅ Apply Update
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b' }}>
          <p>Real-time monitoring system for IncentEdge platform</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Updated July 26, 2025 • 907 active programs tracked
          </p>
        </div>
      </div>
    </div>
  );
}