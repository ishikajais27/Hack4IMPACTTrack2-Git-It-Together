'use client'

export default function ContactPage() {
  return (
    <div className="contact">
      <div className="contact__header">
        <h1>Contact Us</h1>
        <p>Have questions? We're here to help farmers of Odisha.</p>
      </div>

      <div className="contact__grid">
        {/* Form */}
        <form className="contact__form" onSubmit={(e) => e.preventDefault()}>
          <div className="contact__field">
            <label htmlFor="c-name">Your Name</label>
            <input id="c-name" type="text" placeholder="Full name" required />
          </div>
          <div className="contact__field">
            <label htmlFor="c-phone">Phone Number</label>
            <input
              id="c-phone"
              type="tel"
              placeholder="10-digit mobile"
              required
            />
          </div>
          <div className="contact__field">
            <label htmlFor="c-subject">Subject</label>
            <input
              id="c-subject"
              type="text"
              placeholder="What is it about?"
              required
            />
          </div>
          <div className="contact__field">
            <label htmlFor="c-message">Message</label>
            <textarea
              id="c-message"
              rows={5}
              placeholder="Describe your issue or question..."
              required
            />
          </div>
          <button type="submit" className="contact__submit">
            Send Message →
          </button>
        </form>

        {/* Info cards */}
        <div className="contact__info">
          <div className="contact__info-card">
            <span className="contact__info-icon">📞</span>
            <div>
              <h3>Helpline</h3>
              <p>
                1800-XXX-XXXX (Toll Free)
                <br />
                Mon–Sat, 8am–6pm
              </p>
            </div>
          </div>
          <div className="contact__info-card">
            <span className="contact__info-icon">📧</span>
            <div>
              <h3>Email</h3>
              <p>support@krishimitra.in</p>
            </div>
          </div>
          <div className="contact__info-card">
            <span className="contact__info-icon">📍</span>
            <div>
              <h3>Location</h3>
              <p>Bhubaneswar, Odisha, India</p>
            </div>
          </div>
          <div className="contact__info-card">
            <span className="contact__info-icon">💬</span>
            <div>
              <h3>WhatsApp</h3>
              <p>
                Send "HELP" to +91-XXXXX-XXXXX
                <br />
                Get replies in Odia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
