'use client'
import { useState } from 'react'
import Link from 'next/link'

type Mode = 'login' | 'signup'

interface Props {
  defaultMode?: Mode
}

export default function AuthPage({ defaultMode = 'login' }: Props) {
  const [mode, setMode] = useState<Mode>(defaultMode)

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__logo">
          🌿 Krishi<span>Mitra</span>
        </div>
        <p className="auth__subtitle">
          {mode === 'login'
            ? 'Welcome back, farmer 🙏'
            : 'Join thousands of Odisha farmers'}
        </p>

        {/* Tab switcher */}
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

        {/* Form */}
        {mode === 'login' ? <LoginForm /> : <SignupForm />}

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
    </div>
  )
}

function LoginForm() {
  return (
    <form className="auth__form" onSubmit={(e) => e.preventDefault()}>
      <div className="auth__field">
        <label htmlFor="email">Phone / Email</label>
        <input
          id="email"
          type="text"
          placeholder="Enter your phone or email"
          required
        />
      </div>
      <div className="auth__field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter password"
          required
        />
      </div>
      <button type="submit" className="auth__submit">
        Login →
      </button>
    </form>
  )
}

function SignupForm() {
  return (
    <form className="auth__form" onSubmit={(e) => e.preventDefault()}>
      <div className="auth__field">
        <label htmlFor="name">Full Name</label>
        <input id="name" type="text" placeholder="Your name" required />
      </div>
      <div className="auth__field">
        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          type="tel"
          placeholder="10-digit mobile number"
          required
        />
      </div>
      <div className="auth__field">
        <label htmlFor="district">District (Odisha)</label>
        <input
          id="district"
          type="text"
          placeholder="e.g. Cuttack, Puri, Koraput"
        />
      </div>
      <div className="auth__field">
        <label htmlFor="pass">Password</label>
        <input
          id="pass"
          type="password"
          placeholder="Create a password"
          required
        />
      </div>
      <button type="submit" className="auth__submit">
        Create Account →
      </button>
    </form>
  )
}
