'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'signup'

interface Props {
  defaultMode?: Mode
}

export default function AuthPage({ defaultMode = 'login' }: Props) {
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [animState, setAnimState] = useState<'entering' | 'idle' | 'exiting'>('entering')
  const router = useRouter()

  // Slide in from left on mount
  useEffect(() => {
    const t = setTimeout(() => setAnimState('idle'), 500)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = () => {
    setAnimState('exiting')
    setTimeout(() => router.push('/'), 500)
  }

  return (
    <div className="auth">
      <div
        className={`auth__card auth__card--${animState}`}
      >
        <div className="auth__logo">
          🌿 Krishi<span>Mitra</span>
        </div>
        <p className="auth__subtitle">
          {mode === 'login'
            ? 'Welcome back, farmer 🙏'
            : 'Join thousands of Odisha farmers'}
        </p>

        <div className="auth__tabs">
          <button
            className={`auth__tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`auth__tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'login'
          ? <LoginForm onSubmit={handleSubmit} />
          : <SignupForm onSubmit={handleSubmit} />}

        <p className="auth__switch">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')}>Sign up</button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button onClick={() => setMode('login')}>Login</button>
            </>
          )}
        </p>
      </div>

      <style jsx>{`
        .auth__card {
          transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.45s ease;
        }

        /* Starts off-screen to the left */
        .auth__card--entering {
          transform: translateX(-120%);
          opacity: 0;
        }

        /* Settled in center */
        .auth__card--idle {
          transform: translateX(0);
          opacity: 1;
        }

        /* Flies off to the right */
        .auth__card--exiting {
          transform: translateX(120%);
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

function LoginForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form className="auth__form" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      <div className="auth__field">
        <label htmlFor="email">Phone / Email</label>
        <input id="email" type="text" placeholder="Enter your phone or email" required />
      </div>
      <div className="auth__field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" placeholder="Enter password" required />
      </div>
      <button type="submit" className="auth__submit">Login →</button>
    </form>
  )
}

function SignupForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form className="auth__form" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      <div className="auth__field">
        <label htmlFor="name">Full Name</label>
        <input id="name" type="text" placeholder="Your name" required />
      </div>
      <div className="auth__field">
        <label htmlFor="phone">Phone Number</label>
        <input id="phone" type="tel" placeholder="10-digit mobile number" required />
      </div>
      <div className="auth__field">
        <label htmlFor="district">District (Odisha)</label>
        <input id="district" type="text" placeholder="e.g. Cuttack, Puri, Koraput" />
      </div>
      <div className="auth__field">
        <label htmlFor="pass">Password</label>
        <input id="pass" type="password" placeholder="Create a password" required />
      </div>
      <button type="submit" className="auth__submit">Create Account →</button>
    </form>
  )
}