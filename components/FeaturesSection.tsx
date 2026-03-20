'use client'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'

function useScrollVisible(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

const FEATURES = [
  {
    number:   '01',
    tag:      'AI POWERED',
    title:    'Livestock\nHealth Monitor',
    desc:     "Upload a photo of your animal and get an instant diagnosis with treatment advice in Odia — before it's too late. Works even in low-connectivity areas.",
    palette:  'linear-gradient(135deg, #1a0800 0%, #3a1002 40%, #8a2e04 100%)',
    accent:   '#FF9A2E',
    glowColor:'rgba(255,154,46,0.55)',
    icon:     '🐄',
    href:     '/livestock',
    label:    'Amber Ember · Warm Fire on Charcoal',
    image:    '/cow.png',
    imgHeight: 220,
    swatches: ['#FF9A2E','#E87010','#C04808','#8A2E04','#3A1002','#1A0800'],
  },
  {
    number:   '02',
    tag:      'AI POWERED',
    title:    'Crop\nDoctor',
    desc:     'Photo of a diseased leaf? Identify the disease instantly and get step-by-step treatment — works offline too. Supports all major Odisha crops.',
    palette:  'linear-gradient(135deg, #041200 0%, #0a2800 40%, #1e8a00 100%)',
    accent:   '#AAFF00',
    glowColor:'rgba(170,255,0,0.5)',
    icon:     '🌾',
    href:     '/crop',
    label:    'Toxic Lime · Acid Green on Midnight',
    image:    'leaf.png',
    imgHeight: 220,
    swatches: ['#AAFF00','#7AE800','#48C400','#1E8A00','#0A5000','#042800'],
  },
  {
    number:   '03',
    tag:      'COMING SOON',
    title:    'Market\nPrice Alerts',
    desc:     'Daily mandi price updates so you know the best time to sell. Never lose money to bad timing again. Get alerts via SMS in Odia.',
    palette:  'linear-gradient(135deg, #000820 0%, #001850 40%, #0060C0 100%)',
    accent:   '#00D4FF',
    glowColor:'rgba(0,212,255,0.5)',
    icon:     '📈',
    href:     '#',
    label:    'Ocean Surge · Electric Cyan on Deep Navy',
    image:    'graph.png',
    imgHeight: 265,   // larger for the graph
    swatches: ['#00D4FF','#0098E8','#0060C0','#003808','#001850','#000820'],
  },
  {
    number:   '04',
    tag:      'COMING SOON',
    title:    'Mind\nPulse',
    desc:     "Silent mental wellness check through how you type. No forms, no questions, no stigma. Built with care for the farmer's invisible burdens.",
    palette:  'linear-gradient(135deg, #0d0020 0%, #220060 40%, #7010D0 100%)',
    accent:   '#D050FF',
    glowColor:'rgba(208,80,255,0.5)',
    icon:     '🧠',
    href:     '#',
    label:    'Aurora Violet · Vivid Magenta on Deep Indigo',
    image:    'brain.png',
    imgHeight: 220,
    swatches: ['#D050FF','#A030F0','#7010D0','#4800A0','#220060','#0D0020'],
  },
]

function FeatureRow({ feat, index }: { feat: typeof FEATURES[0]; index: number }) {
  const { ref, visible } = useScrollVisible(0.12)
  const [imgErr, setImgErr] = useState(false)
  const fromLeft = index % 2 === 0

  const cardAnim: React.CSSProperties = {
    transition: 'opacity 0.75s ease, transform 0.75s cubic-bezier(0.22,1,0.36,1)',
    opacity:   visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : fromLeft ? 'translateX(-80px)' : 'translateX(80px)',
  }
  const infoAnim: React.CSSProperties = {
    transition: 'opacity 0.75s 0.13s ease, transform 0.75s 0.13s cubic-bezier(0.22,1,0.36,1)',
    opacity:   visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : fromLeft ? 'translateX(80px)' : 'translateX(-80px)',
  }

  return (
    <div ref={ref} style={{
      display: 'grid',
      gridTemplateColumns: '1fr 380px',
      minHeight: 340,
      borderRadius: 14,
      overflow: 'hidden',
      border: `1px solid ${feat.accent}1e`,
      boxShadow: `0 4px 80px ${feat.accent}12`,
    }}>

      {/* ══ GRADIENT CARD ══ */}
      <div style={{
        ...cardAnim,
        background: feat.palette,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 36px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: feat.accent, opacity: 0.65 }}>
            {feat.number} — {feat.tag}
          </span>
          <span style={{ fontSize: '1.9rem', lineHeight: 1 }}>{feat.icon}</span>
        </div>

        {/* flex body: image LEFT | text RIGHT */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* IMAGE */}
          <div style={{
            flex: '0 0 50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px 20px 28px',
          }}>
            {!imgErr ? (
              <img
                src={feat.image}
                alt={feat.title.replace('\n', ' ')}
                onError={() => setImgErr(true)}
                style={{
                  width: '100%',
                  maxHeight: feat.imgHeight,
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: 0,
                  boxShadow: 'none',
                  // drop-shadow follows the actual shape of the white image
                  filter: `drop-shadow(0 0 22px ${feat.glowColor}) drop-shadow(0 4px 12px rgba(0,0,0,0.4))`,
                }}
              />
            ) : (
              <div style={{
                width: '100%', height: 200,
                border: `2px dashed ${feat.accent}40`,
                borderRadius: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: 'rgba(0,0,0,0.18)',
              }}>
                <span style={{ fontSize: '3rem', opacity: 0.3 }}>{feat.icon}</span>
                <code style={{ fontSize: '0.55rem', color: `${feat.accent}55`, fontFamily: 'monospace', background: 'rgba(0,0,0,0.25)', padding: '3px 8px', borderRadius: 4 }}>
                  {feat.image}
                </code>
              </div>
            )}
          </div>

          {/* TEXT */}
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            gap: 14,
            padding: '20px 32px 20px 16px',
          }}>
            <h3 style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 'clamp(1.7rem,3.2vw,2.8rem)',
              lineHeight: 0.92, letterSpacing: '0.02em',
              textTransform: 'uppercase', color: '#fff',
              whiteSpace: 'pre-line',
              textShadow: `0 0 28px ${feat.accent}50`,
            }}>
              {feat.title}
            </h3>

            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', fontStyle: 'italic', letterSpacing: '0.04em', lineHeight: 1.5 }}>
              {feat.label}
            </p>

            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {feat.swatches.map((s, i) => (
                <div key={i} title={s} style={{ width: 26, height: 26, borderRadius: 4, background: s, border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }} />
              ))}
            </div>
          </div>
        </div>

        {/* watermark */}
        <span style={{
          position: 'absolute', bottom: -18, right: 14,
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: '7.5rem', lineHeight: 1,
          color: 'rgba(255,255,255,0.035)',
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {feat.number}
        </span>

        {/* bottom glow */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, background: `linear-gradient(to top,${feat.accent}0d,transparent)`, pointerEvents: 'none' }} />
      </div>

      {/* ══ INFO PANEL ══ */}
      <div style={{
        ...infoAnim,
        background: '#080f08',
        padding: '44px 36px 40px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        gap: 22,
        borderLeft: `1px solid ${feat.accent}1c`,
      }}>

        <div style={{ width: 44, height: 3, background: feat.accent, borderRadius: 2 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.85rem', color: `${feat.accent}50`, letterSpacing: '0.12em' }}>
            {feat.number}
          </span>
          <span style={{
            padding: '3px 11px',
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 4,
            background: feat.tag === 'AI POWERED' ? feat.accent : 'transparent',
            color:      feat.tag === 'AI POWERED' ? '#000' : feat.accent,
            border:     feat.tag === 'AI POWERED' ? 'none' : `1px solid ${feat.accent}`,
          }}>
            {feat.tag}
          </span>
        </div>

        <p style={{ fontSize: '0.92rem', color: 'rgba(244,244,240,0.64)', lineHeight: 1.82, fontWeight: 300, maxWidth: 295 }}>
          {feat.desc}
        </p>

        <Link href={feat.href} style={{
          alignSelf: 'flex-start',
          padding: '11px 26px',
          background: feat.accent, color: '#000',
          fontSize: '0.78rem', fontWeight: 700,
          letterSpacing: '0.07em', textTransform: 'uppercase',
          textDecoration: 'none', borderRadius: 5,
          transition: 'opacity .18s, transform .15s',
          display: 'inline-block',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1';   e.currentTarget.style.transform = 'translateY(0)' }}>
          {feat.tag === 'AI POWERED' ? 'Try Now →' : 'Coming Soon'}
        </Link>

        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {FEATURES.map((_, i) => (
            <div key={i} style={{
              width: i === index ? 20 : 5, height: 3, borderRadius: 2,
              background: i === index ? feat.accent : 'rgba(244,244,240,0.11)',
              transition: 'width .3s ease, background .3s ease',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fs-wrap {
          padding: 96px 48px;
          background: #0d1a0d;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (max-width: 960px) {
          .fs-wrap { padding: 64px 24px; gap: 18px; }
        }
        @media (max-width: 720px) {
          .fs-row { grid-template-columns: 1fr !important; }
          .fs-row > div:nth-child(2) { border-left: none !important; border-top: 1px solid rgba(255,255,255,0.07) !important; }
        }
        @media (max-width: 500px) {
          .fs-body { flex-direction: column !important; }
          .fs-body > div:first-child { flex: none !important; padding: 20px 20px 10px !important; }
          .fs-body > div:last-child  { padding: 10px 20px 20px !important; }
        }
      `}</style>

      <section className="fs-wrap">

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2rem,5vw,4rem)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', color: '#f4f4f0' }}>
            Four Tools, One Mission
          </h2>
          <div style={{ flex: 1, height: 1, background: 'rgba(244,244,240,0.1)', alignSelf: 'center' }} />
          <span style={{ fontSize: '0.7rem', color: 'rgba(244,244,240,0.38)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            04 features
          </span>
        </div>

        {FEATURES.map((feat, i) => (
          <FeatureRow key={feat.number} feat={feat} index={i} />
        ))}

      </section>
    </>
  )
}