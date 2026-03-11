import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'IncentEdge — IRA Tax Credit & Incentive Database'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const STATS = [
  { value: '217K+', label: 'Programs' },
  { value: 'Federal', label: 'Coverage' },
  { value: '50 States', label: 'Included' },
] as const

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#112E3C',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4A99A8 0%, #2d7a87 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: '800',
              color: 'white',
            }}
          >
            IE
          </div>
          <span
            style={{
              color: '#4A99A8',
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
            }}
          >
            IncentEdge
          </span>
        </div>

        {/* Main headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '62px',
              fontWeight: '800',
              color: 'white',
              lineHeight: 1.05,
              letterSpacing: '-1px',
              maxWidth: '900px',
            }}
          >
            IRA Tax Credit &amp; Incentive Database
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#7cbfc9',
              fontWeight: '400',
              maxWidth: '800px',
            }}
          >
            217,000+ programs — search federal, state, and local incentives
          </div>
        </div>

        {/* Bottom stats bar */}
        <div style={{ display: 'flex', gap: '48px', alignItems: 'center', width: '100%' }}>
          {STATS.map((stat) => (
            <div
              key={stat.value}
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#4A99A8' }}>
                {stat.value}
              </span>
              <span style={{ fontSize: '18px', color: '#7cbfc9' }}>{stat.label}</span>
            </div>
          ))}
          <div
            style={{
              marginLeft: 'auto',
              background: '#4A99A8',
              color: 'white',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '20px',
              fontWeight: '700',
            }}
          >
            incentedge.com/incentives
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
