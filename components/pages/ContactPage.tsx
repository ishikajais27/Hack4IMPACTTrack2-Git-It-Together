'use client'

export default function ContactPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .contact-wrap {
          min-height: 100vh;
          background: url('/contact-bg.jpg') center center / cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .contact-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.32);
          pointer-events: none;
        }

        .contact-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 820px;
          background: #1e2a1a;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.35);
        }

        /* ── TOP BANNER ── */
        .contact-banner {
          background: #b5f02a;
          padding: 36px 48px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .contact-banner h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          line-height: 0.9;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: #1e2a1a;
        }

        .contact-banner p {
          font-size: 0.85rem;
          color: rgba(30,42,26,0.65);
          max-width: 280px;
          line-height: 1.7;
          font-weight: 400;
          text-align: right;
        }

        /* ── GRID ── */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: rgba(181,240,42,0.08);
        }

        .contact-item {
          background: #1e2a1a;
          padding: 36px 40px;
          display: flex;
          align-items: flex-start;
          gap: 18px;
          transition: background 0.2s;
        }

        .contact-item:hover {
          background: #243020;
        }

        .contact-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(181,240,42,0.1);
          border: 1px solid rgba(181,240,42,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
        }

        .contact-text h4 {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #b5f02a;
          margin-bottom: 6px;
        }

        .contact-text p {
          font-size: 0.92rem;
          color: rgba(244,244,240,0.8);
          line-height: 1.65;
          font-weight: 300;
        }

        .contact-text a {
          color: rgba(244,244,240,0.8);
          text-decoration: none;
          transition: color 0.15s;
        }
        .contact-text a:hover { color: #b5f02a; }

        /* ── FOOTER ROW ── */
        .contact-footer {
          padding: 24px 40px;
          border-top: 1px solid rgba(181,240,42,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .contact-footer p {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(181,240,42,0.4);
        }

        .contact-social {
          display: flex;
          gap: 10px;
        }

        .contact-social a {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(181,240,42,0.08);
          border: 1px solid rgba(181,240,42,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          text-decoration: none;
          transition: background 0.18s;
        }

        .contact-social a:hover {
          background: rgba(181,240,42,0.18);
        }

        @media (max-width: 640px) {
          .contact-banner { flex-direction: column; align-items: flex-start; padding: 28px 24px; }
          .contact-banner p { text-align: left; }
          .contact-grid { grid-template-columns: 1fr; }
          .contact-item { padding: 28px 24px; }
          .contact-footer { padding: 20px 24px; }
        }
      `}</style>

      <div className="contact-wrap">
        <div className="contact-card">

          {/* ── BANNER ── */}
          <div className="contact-banner">
            <h1>Get In<br />Touch</h1>
            <p>Have questions about your crops or livestock? Our team is here to help farmers across Odisha.</p>
          </div>

          {/* ── CONTACT GRID ── */}
          <div className="contact-grid">

            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div className="contact-text">
                <h4>Helpline</h4>
                <p>
                  <a href="tel:1800XXXXXXX">1800-XXX-XXXX</a><br />
                  Toll Free · Mon–Sat, 8am–6pm
                </p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <div className="contact-text">
                <h4>Email</h4>
                <p>
                  <a href="mailto:support@krishimitra.in">support@krishimitra.in</a><br />
                  We reply within 24 hours
                </p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div className="contact-text">
                <h4>Location</h4>
                <p>
                  Bhubaneswar, Odisha<br />
                  India — 751001
                </p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">💬</div>
              <div className="contact-text">
                <h4>WhatsApp</h4>
                <p>
                  <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
                    +91-XXXXX-XXXXX
                  </a><br />
                  Send "HELP" · Replies in Odia
                </p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">🕐</div>
              <div className="contact-text">
                <h4>Working Hours</h4>
                <p>
                  Monday – Saturday<br />
                  8:00 AM – 6:00 PM IST
                </p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">🚨</div>
              <div className="contact-text">
                <h4>Emergency</h4>
                <p>
                  Livestock emergency?<br />
                  Call anytime — 24 × 7 helpline
                </p>
              </div>
            </div>

          </div>

          {/* ── FOOTER ── */}
          <div className="contact-footer">
            <p>KrishiMitra — Farmer Support Division · Odisha</p>
            {/* <div className="contact-social">
              <a href="#" title="Facebook">📘</a>
              <a href="#" title="Twitter">🐦</a>
              <a href="#" title="YouTube">▶️</a>
              <a href="#" title="Instagram">📸</a>
            </div> */}
          </div>

        </div>
      </div>
    </>
  )
}