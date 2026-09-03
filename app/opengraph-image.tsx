import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'IFEHL 2025 (03) - Christian Medical Leadership Training'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />
        
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            maxWidth: '900px',
            margin: '40px',
          }}
        >
          {/* IFEHL Logo */}
          <div
            style={{
              width: '120px',
              height: '120px',
              background: 'white',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <img
              src="/IfHEL. Logo.png"
              alt="IFEHL Logo"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px',
              lineHeight: '1.1',
            }}
          >
            IFEHL 2025 (03)
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '32px',
              color: '#6b7280',
              marginBottom: '30px',
              lineHeight: '1.3',
            }}
          >
            Christian Medical Leadership Training
          </div>

          {/* Event Details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '24px',
              color: '#4b5563',
              lineHeight: '1.4',
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              📅 November 16-23, 2025
            </div>
            <div style={{ marginBottom: '10px' }}>
              📍 Wholeness House, Gwagalada, Abuja
            </div>
            <div>
              🏥 IfEHL
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}