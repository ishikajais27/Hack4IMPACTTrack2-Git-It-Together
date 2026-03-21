'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  defaultMode?: 'login' | 'signup'
}

export default function AuthPage({ defaultMode = 'login' }: Props) {
  const [flipped, setFlipped] = useState(defaultMode === 'signup')
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // ── Detect mobile ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Login state ──
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // ── Register state ──
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regDistrict, setRegDistrict] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  const playFlip = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const dur = 0.38, sr = ctx.sampleRate
      const buf = ctx.createBuffer(1, sr * dur, sr)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) {
        const t = i / sr
        const n = Math.random() * 2 - 1
        const e = Math.exp(-t * 9) * Math.pow(Math.sin((Math.PI * t) / dur), 0.6)
        const s = Math.sin(2 * Math.PI * (290 - t * 260) * t)
        d[i] = (n * 0.38 + s * 0.12) * e * 0.55
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      const lpf = ctx.createBiquadFilter()
      lpf.type = 'lowpass'
      lpf.frequency.value = 1700
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.7, 0)
      gain.gain.exponentialRampToValueAtTime(0.001, dur)
      src.connect(lpf); lpf.connect(gain); gain.connect(ctx.destination)
      src.start()
    } catch (_) {}
  }

  const flip = (to: boolean) => {
    if (!isMobile) playFlip()
    setFlipped(to)
  }

  // ── Handlers ──
  const handleLogin = async () => {
    setLoginError('')
    if (!loginUsername || !loginPassword) { setLoginError('Please enter your phone number and password.'); return }
    setLoginLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setLoginError(data.error || 'Login failed.') }
      else { localStorage.setItem('km_user', JSON.stringify(data.user)); router.push('/dashboard') }
    } catch { setLoginError('Network error. Please try again.') }
    finally { setLoginLoading(false) }
  }

  const handleRegister = async () => {
    setRegError('')
    if (!regName || !regPhone || !regDistrict || !regPassword) { setRegError('All fields are required.'); return }
    setRegLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, phone: regPhone, district: regDistrict, password: regPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setRegError(data.error || 'Registration failed.') }
      else { localStorage.setItem('km_user', JSON.stringify(data.user)); router.push('/dashboard') }
    } catch { setRegError('Network error. Please try again.') }
    finally { setRegLoading(false) }
  }

  // ── Wave SVG (desktop only) ──
  const WAVE_W = 90
  const wavePath = `M32 0 C52 0,68 20,62 72 C54 138,20 158,24 240 C28 322,62 342,56 400 C50 444,38 466,32 480 L${WAVE_W} 480 L${WAVE_W} 0 Z`
  const waveShadow = `M36 0 C56 0,72 20,66 72 C58 138,24 158,28 240 C32 322,66 342,60 400 C54 444,42 466,36 480 L${WAVE_W} 480 L${WAVE_W} 0 Z`

  const WaveSVG = () => (
    <svg
      className="absolute top-0 left-0 h-full pointer-events-none"
      style={{ zIndex: 10, flexShrink: 0 }}
      width={WAVE_W}
      viewBox={`0 0 ${WAVE_W} 480`}
      preserveAspectRatio="none"
    >
      <path d={waveShadow} fill="rgba(0,0,0,0.07)" />
      <path d={wavePath} fill="white" />
    </svg>
  )

  // ════════════════════════════════════════
  // MOBILE LAYOUT
  // ════════════════════════════════════════
  if (isMobile) {
    return (
      <div style={M.page}>
        {/* Background */}
        <div style={M.bgImage} />
        <div style={M.bgScrim} />

        <div style={M.card}>
          {/* Logo */}
          <div style={M.logoRow}>
            <div style={M.logoCircle}><span style={{ fontSize: 20 }}>🌱</span></div>
            <div>
              <div style={M.logoText}>KRISHI</div>
              <div style={M.logoText}>MITRA</div>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={M.tabBar}>
            <button
              style={{ ...M.tab, ...(flipped ? {} : M.tabActive) }}
              onClick={() => flip(false)}
            >
              Login
            </button>
            <button
              style={{ ...M.tab, ...(flipped ? M.tabActive : {}) }}
              onClick={() => flip(true)}
            >
              Sign Up
            </button>
          </div>

          {/* Login panel */}
          {!flipped && (
            <div style={M.formBody}>
              <p style={M.formTitle}>Welcome back, farmer 🙏</p>
              <MobileField id="m-li-user" label="Phone Number" type="tel" placeholder="10-digit phone number" value={loginUsername} onChange={setLoginUsername} />
              <MobileField id="m-li-pass" label="Password" type="password" placeholder="Enter your password" value={loginPassword} onChange={setLoginPassword} />
              <p style={M.forgotLink}>Forgot Password?</p>
              {loginError && <p style={M.errorText}>{loginError}</p>}
              <GreenBtn onClick={handleLogin} disabled={loginLoading}>
                {loginLoading ? 'Logging in…' : 'Login →'}
              </GreenBtn>
              <p style={M.switchText}>
                Don't have an account?{' '}
                <button type="button" onClick={() => flip(true)} style={M.switchLink}>Register Now</button>
              </p>
              <p style={M.terms}>Terms and Services</p>
              <p style={M.copyright}>© 2025 KrishiMitra · Odisha</p>
            </div>
          )}

          {/* Sign up panel */}
          {flipped && (
            <div style={M.formBody}>
              <p style={M.formTitle}>Join thousands of Odisha farmers 🙏</p>
              <div style={M.twoCol}>
                <MobileField id="m-su-name" label="Full Name" type="text" placeholder="Your name" value={regName} onChange={setRegName} />
                <MobileField id="m-su-phone" label="Phone Number" type="tel" placeholder="10-digit" value={regPhone} onChange={setRegPhone} />
              </div>
              <MobileField id="m-su-district" label="District (Odisha)" type="text" placeholder="e.g. Cuttack, Puri, Koraput" value={regDistrict} onChange={setRegDistrict} />
              <MobileField id="m-su-pass" label="Password" type="password" placeholder="Create a password" value={regPassword} onChange={setRegPassword} />
              {regError && <p style={M.errorText}>{regError}</p>}
              <GreenBtn onClick={handleRegister} disabled={regLoading}>
                {regLoading ? 'Creating Account…' : 'Create Account →'}
              </GreenBtn>
              <p style={M.switchText}>
                Already registered?{' '}
                <button type="button" onClick={() => flip(false)} style={M.switchLink}>Login</button>
              </p>
              <p style={M.terms}>Terms and Services</p>
            </div>
          )}
        </div>

        <style>{`
          * { box-sizing: border-box; }
          input { box-sizing: border-box; }
        `}</style>
      </div>
    )
  }

  // ════════════════════════════════════════
  // DESKTOP LAYOUT (original flip card)
  // ════════════════════════════════════════
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative"
      style={{
        backgroundImage: 'url(contact-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1e4a34',
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(10,30,18,0.45)' }} />

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          width: 900,
          maxWidth: '100%',
          height: 480,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          perspective: '1400px',
          zIndex: 1,
        }}
      >
        {/* Left image */}
        <div className="absolute inset-y-0 left-0 z-[1]" style={{ width: '50%' }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/login.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#2d5a45',
            }}
          />
        </div>

        {/* Right white base */}
        <div className="absolute inset-y-0 right-0 z-[1] bg-white" style={{ width: '50%' }} />

        {/* Signup panel (behind) */}
        <div
          className="absolute inset-y-0 z-[5]"
          style={{
            left: 'calc(50% - 60px)',
            right: 0,
            opacity: flipped ? 1 : 0,
            pointerEvents: flipped ? 'all' : 'none',
            transition: 'opacity 0.18s ease',
            transitionDelay: flipped ? '0.5s' : '0s',
          }}
        >
          <WaveSVG />
          <div
            className="absolute top-0 bottom-0 right-0 bg-white flex flex-col justify-center"
            style={{ left: WAVE_W - 2, padding: '0 48px 0 22px' }}
          >
            <p style={{ fontSize: 26, fontWeight: 700, color: '#1a3d2a', margin: '0 0 3px', fontFamily: 'sans-serif' }}>Sign Up</p>
            <p style={{ fontSize: 12, color: '#7a9e8a', margin: '0 0 18px', fontFamily: 'sans-serif' }}>Join thousands of Odisha farmers 🙏</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <FormField id="su-name" label="Full Name" type="text" placeholder="Your name" value={regName} onChange={setRegName} />
              <FormField id="su-phone" label="Phone Number" type="tel" placeholder="10-digit" value={regPhone} onChange={setRegPhone} />
            </div>
            <FormField id="su-district" label="District (Odisha)" type="text" placeholder="e.g. Cuttack, Puri, Koraput" value={regDistrict} onChange={setRegDistrict} />
            <div style={{ marginTop: 12 }}>
              <FormField id="su-pass" label="Password" type="password" placeholder="Create a password" value={regPassword} onChange={setRegPassword} />
            </div>
            {regError && <p style={{ fontSize: 11.5, color: '#c0392b', margin: '8px 0 0', fontFamily: 'sans-serif' }}>{regError}</p>}
            <div style={{ marginTop: 16 }}>
              <GreenBtn onClick={handleRegister} disabled={regLoading}>{regLoading ? 'Creating Account…' : 'Create Account →'}</GreenBtn>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12.5, color: '#555', margin: '12px 0 0', fontFamily: 'sans-serif' }}>
              Already registered?{' '}
              <button type="button" onClick={() => flip(false)} style={{ color: '#2d5a45', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 12.5, fontFamily: 'sans-serif' }}>Login</button>
            </p>
            <p style={{ textAlign: 'center', fontSize: 10, color: '#c0d8ca', margin: '10px 0 0', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'sans-serif' }}>Terms and Services</p>
          </div>
        </div>

        {/* Login page — flip animation */}
        <div
          className="absolute inset-y-0 z-10"
          style={{
            left: 'calc(50% - 60px)',
            right: 0,
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.84s cubic-bezier(0.4,0,0.2,1)',
            transform: flipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front: Login form */}
          <div className="absolute inset-0 flex" style={{ backfaceVisibility: 'hidden' }}>
            <WaveSVG />
            <div className="absolute top-0 bottom-0 right-0 bg-white flex flex-col justify-center" style={{ left: WAVE_W - 2, padding: '0 48px 0 22px' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                <div className="flex items-center justify-center rounded-full" style={{ width: 34, height: 34, background: '#1e4a34', flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>🌱</span>
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 800, color: '#1e4a34', letterSpacing: '0.07em', lineHeight: 1.2, margin: 0 }}>KRISHI</p>
                  <p style={{ fontSize: 9, fontWeight: 900, color: '#1e4a34', letterSpacing: '0.07em', lineHeight: 1.2, margin: 0 }}>MITRA</p>
                </div>
              </div>
              <p style={{ fontSize: 30, fontWeight: 700, color: '#1a3d2a', margin: '0 0 3px', fontFamily: 'sans-serif' }}>Login</p>
              <p style={{ fontSize: 12, color: '#7a9e8a', margin: '0 0 20px', fontFamily: 'sans-serif' }}>Welcome back, farmer 🙏</p>
              <FormField id="li-user" label="Phone Number" type="tel" placeholder="Enter your 10-digit phone number" value={loginUsername} onChange={setLoginUsername} />
              <div style={{ marginTop: 13 }}>
                <FormField id="li-pass" label="Password" type="password" placeholder="Enter your password" value={loginPassword} onChange={setLoginPassword} />
              </div>
              <p style={{ textAlign: 'right', fontSize: 11, color: '#8aab96', margin: '7px 0 16px', cursor: 'pointer', fontFamily: 'sans-serif' }}>Forgot Password?</p>
              {loginError && <p style={{ fontSize: 11.5, color: '#c0392b', margin: '-8px 0 10px', fontFamily: 'sans-serif' }}>{loginError}</p>}
              <GreenBtn onClick={handleLogin} disabled={loginLoading}>{loginLoading ? 'Logging in…' : 'Login →'}</GreenBtn>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: '#555', margin: '12px 0 0', fontFamily: 'sans-serif' }}>
                Don't have an account?{' '}
                <button type="button" onClick={() => flip(true)} style={{ color: '#2d5a45', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 12.5, fontFamily: 'sans-serif' }}>Register Now</button>
              </p>
              <p style={{ textAlign: 'center', fontSize: 10, color: '#c0d8ca', margin: '12px 0 0', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'sans-serif' }}>Terms and Services</p>
              <p style={{ textAlign: 'center', fontSize: 8.5, color: '#c0d8ca', margin: '8px 0 0', fontFamily: 'sans-serif' }}>© 2025 KrishiMitra · Odisha</p>
            </div>
          </div>

          {/* Back: translucent mid-flip face */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'transparent' }} />
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════
// MOBILE STYLES
// ════════════════════════════════════════
const M: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '0',
    position: 'relative',
    overflowY: 'auto',
    backgroundColor: '#1e4a34',
  },
  bgImage: {
    position: 'fixed',
    inset: 0,
    backgroundImage: 'url(contact-bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 0,
    pointerEvents: 'none',
  },
  bgScrim: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10,30,18,0.55)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 440,
    margin: '0 auto',
    background: '#fff',
    borderRadius: '0 0 28px 28px',
    boxShadow: '0 16px 60px rgba(0,0,0,0.5)',
    padding: '28px 24px 32px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: '#1e4a34',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 10,
    fontWeight: 900,
    color: '#1e4a34',
    letterSpacing: '0.1em',
    lineHeight: 1.3,
    margin: 0,
  },
  tabBar: {
    display: 'flex',
    border: '2px solid #e8f0e8',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    padding: '10px 0',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'sans-serif',
    border: 'none',
    background: 'transparent',
    color: '#7a9e8a',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
    letterSpacing: '0.02em',
  },
  tabActive: {
    background: '#1e4a34',
    color: '#fff',
    borderRadius: 10,
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    flex: 1,
  },
  formTitle: {
    fontSize: 13,
    color: '#7a9e8a',
    margin: '0 0 4px',
    fontFamily: 'sans-serif',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#c0392b',
    margin: 0,
    fontFamily: 'sans-serif',
  },
  forgotLink: {
    textAlign: 'right',
    fontSize: 12,
    color: '#8aab96',
    margin: '-6px 0 0',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
  },
  switchText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#555',
    margin: '4px 0 0',
    fontFamily: 'sans-serif',
  },
  switchLink: {
    color: '#2d5a45',
    fontWeight: 700,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: 13,
    fontFamily: 'sans-serif',
    padding: 0,
  },
  terms: {
    textAlign: 'center',
    fontSize: 11,
    color: '#aac8b8',
    margin: '0',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
  },
  copyright: {
    textAlign: 'center',
    fontSize: 10,
    color: '#c8dac8',
    margin: '0',
    fontFamily: 'sans-serif',
  },
}

// ════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════
function GreenBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px',
        background: disabled ? '#7aaa90' : '#2d5a45',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'sans-serif',
        letterSpacing: '0.02em',
        transition: 'background 0.2s',
      }}
      onMouseOver={(e) => { if (!disabled) e.currentTarget.style.background = '#1e4a34' }}
      onMouseOut={(e) => { if (!disabled) e.currentTarget.style.background = '#2d5a45' }}
    >
      {children}
    </button>
  )
}

// Desktop form field (dark input)
function FormField({ id, label, type, placeholder, value, onChange }: { id: string; label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: '#3a5a48', fontFamily: 'sans-serif' }}>{label}</label>
      <input
        id={id} type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '9px 13px', border: 'none', borderRadius: 8, fontSize: 13, background: '#2e2e2e', color: '#eee', boxSizing: 'border-box', outline: 'none', fontFamily: 'sans-serif' }}
        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px rgba(45,90,69,0.5)')}
        onBlur={(e) => (e.target.style.boxShadow = 'none')}
      />
    </div>
  )
}

// Mobile form field (light input, better on white card)
function MobileField({ id, label, type, placeholder, value, onChange }: { id: string; label: string; type: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: '#3a5a48', fontFamily: 'sans-serif' }}>{label}</label>
      <input
        id={id} type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #d4e8d8', borderRadius: 8, fontSize: 14, background: '#f7fbf8', color: '#1a3d2a', boxSizing: 'border-box', outline: 'none', fontFamily: 'sans-serif' }}
        onFocus={(e) => { e.target.style.borderColor = '#2d5a45'; e.target.style.boxShadow = '0 0 0 3px rgba(45,90,69,0.12)' }}
        onBlur={(e) => { e.target.style.borderColor = '#d4e8d8'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}