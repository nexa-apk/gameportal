import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'NexaGames - Free Online Games'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 300,
            borderRadius: 300,
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Controller icon */}
        <div style={{ fontSize: 80, marginBottom: 24 }}>🎮</div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: '-2px',
            display: 'flex',
            gap: 0,
          }}
        >
          <span style={{ color: '#ffffff' }}>Nexa</span>
          <span style={{ color: '#fb923c' }}>Games</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            marginTop: 20,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Play Free Games Now
        </div>

        {/* Badge */}
        <div
          style={{
            marginTop: 36,
            background: '#f97316',
            color: '#ffffff',
            fontSize: 20,
            fontWeight: 700,
            padding: '12px 36px',
            borderRadius: 999,
            letterSpacing: 1,
          }}
        >
          19+ Free Browser Games
        </div>
      </div>
    ),
    { ...size },
  )
}
