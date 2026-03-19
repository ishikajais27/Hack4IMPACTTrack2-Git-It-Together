'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header__inner">
        {/* Logo */}
        <Link href="/" className="header__logo">
          🌿 Krishi<span>Mitra</span>
        </Link>

        {/* Nav */}
        <nav className={`header__nav ${menuOpen ? 'open' : ''}`}>
          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/livestock" onClick={() => setMenuOpen(false)}>
            Livestock
          </Link>
          <Link href="/crop" onClick={() => setMenuOpen(false)}>
            Crop Doctor
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
          <Link href="/mindpulse" onClick={() => setMenuOpen(false)}>
            MindPulse
          </Link>
          <Link href="/marketprice" onClick={() => setMenuOpen(false)}>
            MarketPrice
          </Link>
        </nav>

        {/* Auth buttons */}
        <div className="header__actions">
          <Link
            href="/login"
            className="btn btn-outline"
            style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="btn btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="header__menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}
