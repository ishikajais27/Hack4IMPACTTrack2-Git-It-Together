import Link from 'next/link'

const features = [
  {
    icon: '🐄',
    title: 'Livestock Health Monitor',
    desc: "Upload a photo of your animal. Get an instant diagnosis and treatment advice in Odia before it's too late.",
    tag: 'AI Powered',
    href: '/livestock',
  },
  {
    icon: '🌾',
    title: 'Crop Doctor',
    desc: 'Photo of a diseased leaf? Identify the disease instantly and get step-by-step treatment — works offline.',
    tag: 'AI Powered',
    href: '/crop',
  },
  {
    icon: '📈',
    title: 'Market Price Alerts',
    desc: 'Daily price updates so you know the best time to sell. Never lose money to bad timing again.',
    tag: 'Coming Soon',
    href: '#',
  },
  {
    icon: '🧠',
    title: 'Mind Pulse',
    desc: 'Silent mental wellness check through how you type. No forms, no questions, no stigma.',
    tag: 'Coming Soon',
    href: '#',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="home__hero">
        <span className="home__badge">🌿 Built for Odisha Farmers</span>
        <h1 className="home__title">
          Your farm's <span>AI companion</span>,<br />
          always by your side
        </h1>
        <p className="home__desc">
          Diagnose livestock illness, identify crop disease, track market prices
          — in Odia, on any phone.
        </p>
        <div className="home__cta">
          <Link href="/livestock" className="btn btn-primary">
            Check Livestock
          </Link>
          <Link href="/crop" className="btn btn-outline">
            Diagnose Crop
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="home__features">
        <h2 className="home__features-title">Four tools, one mission</h2>
        <div className="home__grid">
          {features.map((f) => (
            <Link key={f.title} href={f.href} className="feature-card">
              <span className="feature-card__icon">{f.icon}</span>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
              <span className="feature-card__tag">{f.tag}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
