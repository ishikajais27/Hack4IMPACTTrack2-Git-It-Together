'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

interface MandiRecord {
  district: string; market: string; commodity: string; variety: string
  arrival_date: string; min_price: string; max_price: string; modal_price: string
}
interface SavedAlert {
  cropApi: string; cropHindi: string; cropEmoji: string; district: string
  phone: string; lastPrice: number; lastDate: string
}

const CROPS = [
  { emoji: '🌾', odia: 'ଧାନ', hindi: 'Dhan', api: 'Paddy' },
  { emoji: '🍚', odia: 'ଚାଉଳ', hindi: 'Chawal', api: 'Rice' },
  { emoji: '🥔', odia: 'ଆଳୁ', hindi: 'Aloo', api: 'Potato' },
  { emoji: '🍅', odia: 'ଟମାଟ', hindi: 'Tamatar', api: 'Tomato' },
  { emoji: '🧅', odia: 'ପିଆଜ', hindi: 'Pyaaz', api: 'Onion' },
  { emoji: '🌽', odia: 'ମକା', hindi: 'Makka', api: 'Maize' },
  { emoji: '🌶', odia: 'ଲଙ୍କା', hindi: 'Mirchi', api: 'Green Chilli' },
  { emoji: '🍆', odia: 'ବାଇଗଣ', hindi: 'Baingan', api: 'Brinjal' },
  { emoji: '🥦', odia: 'ଫୁଲକୋବି', hindi: 'Gobhi', api: 'Cauliflower' },
  { emoji: '🥜', odia: 'ଚିନାବାଦାମ', hindi: 'Moongfali', api: 'Groundnut' },
  { emoji: '🌿', odia: 'ସୋରିଷ', hindi: 'Sarson', api: 'Mustard' },
  { emoji: '🍌', odia: 'କଦଳୀ', hindi: 'Kela', api: 'Banana' },
  { emoji: '🥭', odia: 'ଆମ୍ବ', hindi: 'Aam', api: 'Mango' },
]

const UNITS = [
  { label: '250 gm', kg: 0.25 }, { label: '500 gm', kg: 0.5 },
  { label: '1 Kilo', kg: 1 },   { label: '2 Kilo', kg: 2 },
  { label: '5 Kilo', kg: 5 },   { label: '10 Kilo', kg: 10 },
  { label: '20 Kilo', kg: 20 }, { label: '50 Kilo', kg: 50 },
  { label: '1 Quintal (100 kg)', kg: 100 },
]

const DISTRICTS = [
  { name: 'Cuttack', icon: '🏙️', tag: 'Major Mandi' },
  { name: 'Puri', icon: '🛕', tag: 'Coastal' },
  { name: 'Bhubaneswar', icon: '🌆', tag: 'Capital City' },
  { name: 'Sambalpur', icon: '🌊', tag: 'Western Hub' },
  { name: 'Berhampur', icon: '🏪', tag: 'South Hub' },
  { name: 'Balasore', icon: '🌾', tag: 'North Coast' },
  { name: 'Bhadrak', icon: '🌿', tag: 'River Belt' },
  { name: 'Koraput', icon: '⛰️', tag: 'Tribal Belt' },
  { name: 'Rayagada', icon: '🌄', tag: 'Hill District' },
  { name: 'Ganjam', icon: '🏝️', tag: 'South Coast' },
  { name: 'Kendrapara', icon: '🦀', tag: 'Delta Region' },
  { name: 'Jajpur', icon: '🏭', tag: 'Industrial' },
  { name: 'Dhenkanal', icon: '🌳', tag: 'Central' },
  { name: 'Keonjhar', icon: '⛏️', tag: 'Mining Belt' },
  { name: 'Angul', icon: '🔥', tag: 'Industrial' },
  { name: 'Sundargarh', icon: '🏔️', tag: 'Northern' },
  { name: 'Mayurbhanj', icon: '🐯', tag: 'Forest Belt' },
  { name: 'Bargarh', icon: '🌾', tag: 'Rice Bowl' },
  { name: 'Bolangir', icon: '🌻', tag: 'Western' },
]

function priceForUnit(perQuintal: number, kg: number): string {
  const val = (perQuintal / 100) * kg
  if (val < 1) return `${(val * 100).toFixed(0)} paise`
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 1 })}`
}

function getAdvice(modal: number, allPrices: number[]) {
  if (allPrices.length < 2) return { emoji: '🟡', color: '#d97706', text: 'Thoda Ruko', sub: 'Aur mandis ka data nahi mila. Kal dobara check karo.' }
  const max = Math.max(...allPrices), min = Math.min(...allPrices)
  const pct = (modal - min) / (max - min || 1)
  if (pct >= 0.65) return { emoji: '🟢', color: '#16a34a', text: 'ABHI BECHO!', sub: 'Aaj bhav bahut achha hai. Jaldi karo.' }
  if (pct >= 0.35) return { emoji: '🟡', color: '#d97706', text: 'Thoda Ruko', sub: 'Bhav theek hai, par aur upar ja sakta hai.' }
  return { emoji: '🔴', color: '#dc2626', text: 'MAT BECHO', sub: 'Bhav abhi bahut kam hai. Ruko.' }
}

function buildWAMsg(crop: typeof CROPS[0], district: string, best: MandiRecord, unitLabel: string, unitPrice: string, advice: ReturnType<typeof getAdvice>): string {
  return `🌾 *KrishiMitra — Aaj ka Mandi Bhav*\n\nFasal: ${crop.emoji} ${crop.hindi} (${crop.odia})\nDistrict: 📍 ${district}\nMandi: 🏪 ${best.market}\n\n💰 *${unitLabel} ka bhav: ${unitPrice}*\n📦 1 Quintal (100kg): ₹${parseFloat(best.modal_price).toLocaleString('en-IN')}\n\n${advice.emoji} *${advice.text}*\n${advice.sub}\n\n📅 ${best.arrival_date} | Agmarknet data\n_KrishiMitra app se bheja gaya_`
}

type Step = 'crop' | 'district' | 'loading' | 'result' | 'alert_setup' | 'error'

export default function MarketPricePage() {
  const [step, setStep] = useState<Step>('crop')
  const [crop, setCrop] = useState<typeof CROPS[0] | null>(null)
  const [district, setDistrict] = useState('')
  const [records, setRecords] = useState<MandiRecord[]>([])
  const [errMsg, setErrMsg] = useState('')
  const [unitIdx, setUnitIdx] = useState(2)
  const [phone, setPhone] = useState('')
  const [alertSaved, setAlertSaved] = useState(false)
  const [savedAlerts, setSavedAlerts] = useState<SavedAlert[]>([])
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try { const s = localStorage.getItem('km_alerts'); if (s) setSavedAlerts(JSON.parse(s)) } catch {}
  }, [])

  const fetchPrices = useCallback(async (c: typeof CROPS[0], dist: string) => {
    setStep('loading'); setRecords([])
    const key = process.env.NEXT_PUBLIC_DATAGOV_API_KEY
    if (!key) { setErrMsg('no_key'); setStep('error'); return }
    try {
      const params = new URLSearchParams({ 'api-key': key, format: 'json', limit: '50', filters: JSON.stringify({ State: 'Odisha', Commodity: c.api, District: dist }) })
      const res = await fetch(`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}`)
      if (res.status === 403) { setErrMsg('bad_key'); setStep('error'); return }
      if (!res.ok) { setErrMsg('server'); setStep('error'); return }
      const data = await res.json()
      const recs: MandiRecord[] = data.records ?? []
      if (!recs.length) { setErrMsg('no_data'); setStep('error'); return }
      recs.sort((a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price))
      setRecords(recs); setStep('result')
    } catch { setErrMsg('network'); setStep('error') }
  }, [])

  function saveAlert() {
    if (!crop || !phone.trim() || phone.length < 10) return
    const best = records[0]
    const newAlert: SavedAlert = { cropApi: crop.api, cropHindi: crop.hindi, cropEmoji: crop.emoji, district, phone: phone.trim(), lastPrice: parseFloat(best.modal_price), lastDate: best.arrival_date }
    const updated = [newAlert, ...savedAlerts.filter(a => !(a.cropApi === crop.api && a.district === district))]
    setSavedAlerts(updated)
    try { localStorage.setItem('km_alerts', JSON.stringify(updated)) } catch {}
    setAlertSaved(true)
  }

  useEffect(() => {
    if (savedAlerts.length === 0) return
    const key = process.env.NEXT_PUBLIC_DATAGOV_API_KEY
    if (!key) return
    async function checkPrices() {
      for (const alert of savedAlerts) {
        try {
          const params = new URLSearchParams({ 'api-key': key!, format: 'json', limit: '5', filters: JSON.stringify({ State: 'Odisha', Commodity: alert.cropApi, District: alert.district }) })
          const res = await fetch(`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}`)
          if (!res.ok) continue
          const data = await res.json()
          const recs: MandiRecord[] = data.records ?? []
          if (!recs.length) continue
          recs.sort((a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price))
          const newPrice = parseFloat(recs[0].modal_price)
          const changePct = Math.abs((newPrice - alert.lastPrice) / alert.lastPrice) * 100
          if (changePct >= 5) {
            const direction = newPrice > alert.lastPrice ? 'BADH GAYA ↑' : 'GIRA GAYA ↓'
            const waMsg = encodeURIComponent(`🚨 *KrishiMitra Price Alert!*\n\n${alert.cropEmoji} *${alert.cropHindi}* ka bhav ${direction}!\n\n📍 District: ${alert.district}\n🏪 Mandi: ${recs[0].market}\n\nPehle ka bhav: ₹${alert.lastPrice.toLocaleString('en-IN')}/qtl\n*Aaj ka bhav: ₹${newPrice.toLocaleString('en-IN')}/qtl*\nBadlaav: ${changePct.toFixed(1)}%\n\n📅 ${recs[0].arrival_date}\n_KrishiMitra app se auto-alert_`)
            window.open(`https://wa.me/91${alert.phone}?text=${waMsg}`, '_blank')
            const updated = savedAlerts.map(a => a.cropApi === alert.cropApi && a.district === alert.district ? { ...a, lastPrice: newPrice, lastDate: recs[0].arrival_date } : a)
            setSavedAlerts(updated)
            try { localStorage.setItem('km_alerts', JSON.stringify(updated)) } catch {}
          }
        } catch {}
      }
    }
    checkPrices()
    checkRef.current = setInterval(checkPrices, 6 * 60 * 60 * 1000)
    return () => { if (checkRef.current) clearInterval(checkRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAlerts.length])

  function reset() {
    setStep('crop'); setCrop(null); setDistrict(''); setRecords([])
    setErrMsg(''); setAlertSaved(false); setPhone('')
  }

  const best = records[0] ?? null
  const allModal = records.map(r => parseFloat(r.modal_price))
  const advice = best ? getAdvice(parseFloat(best.modal_price), allModal) : null
  const unitObj = UNITS[unitIdx]
  const unitPrice = best ? priceForUnit(parseFloat(best.modal_price), unitObj.kg) : ''

  return (
    <div style={{ minHeight: '100vh', position: 'relative', fontFamily: "'Segoe UI',system-ui,sans-serif", paddingBottom: '4rem' }}>

      {/* ── BACKGROUND ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: "url('/market.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom,rgba(20,35,18,0.62) 0%,rgba(20,35,18,0.45) 55%,transparent 75%)' }} />
      <svg aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <path d="M-10 600 Q130 515 315 555 Q480 590 600 528 Q722 466 885 528 Q1025 585 1162 522 Q1298 460 1450 510 L1450 920 L-10 920 Z" fill="#ede4d3" />
        <path d="M-10 658 Q162 585 372 622 Q552 654 718 592 Q888 528 1072 598 Q1242 656 1450 604 L1450 920 L-10 920 Z" fill="#f5ede0" opacity="0.65" />
      </svg>

      {/* ── TOP BAR ── */}
      <div style={{ width: '100%', height: 44, overflow: 'hidden', background: 'linear-gradient(90deg,#c2410c,#ea580c 40%,#f97316 70%,#fb923c)', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 3px 18px rgba(234,88,12,0.45)' }}>
        {step !== 'crop'
          ? <button onClick={reset} style={{ background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 10, padding: '0.3rem 0.7rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', marginLeft: '0.5rem', flexShrink: 0, whiteSpace: 'nowrap', lineHeight: 1 }}>← Wapas</button>
          : <div style={{ width: 70, flexShrink: 0 }} />}
        <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <div className="km-ticker">
            {[0, 1].map(n => (
              <span key={n} aria-hidden={n === 1} style={{ display: 'inline-block', fontFamily: "'Bebas Neue','DM Sans',sans-serif", fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)', paddingRight: '2rem', whiteSpace: 'nowrap' }}>
                📈 MANDI BHAV &nbsp;•&nbsp; AAJ KA BHAV &nbsp;•&nbsp; ODISHA MANDIS &nbsp;•&nbsp; LIVE AGMARKNET DATA &nbsp;•&nbsp; BECHO YA RUKO &nbsp;•&nbsp; 19 DISTRICTS &nbsp;•&nbsp; 13 FASLEN &nbsp;•&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
        <div style={{ width: 70, flexShrink: 0 }} />
      </div>

      {/* ══ CROP STEP ══ */}
      {step === 'crop' && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ padding: 'clamp(1.5rem,5vw,4rem) clamp(1rem,5vw,5vw) clamp(1.25rem,3vw,3rem)', animation: 'fadeUp 0.6s ease both', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ display: 'inline-block', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', fontSize: '0.88rem', fontWeight: 700, padding: '0.4rem 1.1rem', borderRadius: 99, letterSpacing: '0.04em', alignSelf: 'flex-start' }}>📡 Live · Agmarknet Data</span>
            <h1 style={{ fontSize: 'clamp(2rem,6vw,4.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: 0, letterSpacing: '-0.03em' }}>Aaj ka <span style={{ color: '#f4a261' }}>Mandi Bhav</span></h1>
            <p style={{ fontSize: 'clamp(0.9rem,2.5vw,1.1rem)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.75, margin: 0, maxWidth: 600 }}>Apni fasal chuniye — real-time price aur <strong style={{ color: '#f4a261' }}>"Becho ya Ruko"</strong> advice paiye. Bilkul free 🙏</p>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {['🏪 19 Districts', '🌾 13 Crops', '✅ Daily Update'].map(t => (
                <span key={t} style={{ background: 'rgba(0,0,0,0.38)', border: '1px solid rgba(255,255,255,0.32)', color: '#fff', fontSize: '0.88rem', fontWeight: 700, padding: '0.45rem 1.1rem', borderRadius: 99 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', margin: '0.5rem 0 1rem' }}>
            <h2 style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 700, color: '#FF6B00', fontFamily: 'Georgia,serif', margin: 0 }}>🌿 Apni Fasal Chuniye</h2>
            <p style={{ fontSize: '0.85rem', color: '#555', fontFamily: 'Georgia,serif', margin: '4px 0 0' }}>Tap karke price dekho</p>
          </div>
          {/* className="km-crop-grid" — media queries in <style> below */}
          <div className="km-crop-grid">
            {CROPS.map((c, i) => (
              <button key={c.api} className="km-crop-card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => { setCrop(c); setStep('district') }}>
                <span style={{ position: 'absolute', top: '0.6rem', right: '0.7rem', fontSize: '1rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>›</span>
                <span style={{ fontSize: 'clamp(2rem,6vw,3.4rem)', lineHeight: 1, filter: 'drop-shadow(1px 3px 8px rgba(0,0,0,0.3))', marginBottom: '0.1rem' }}>{c.emoji}</span>
                <span style={{ fontSize: 'clamp(0.85rem,2.5vw,1.1rem)', fontWeight: 900, color: '#000', textAlign: 'center' }}>{c.hindi}</span>
                <span style={{ fontSize: 'clamp(0.7rem,2vw,0.85rem)', color: '#000', fontWeight: 500, textAlign: 'center' }}>{c.odia}</span>
              </button>
            ))}
          </div>
          <div style={{ margin: 'clamp(1rem,3vw,1.5rem) clamp(0.75rem,5vw,5vw) 0', padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16, fontSize: 'clamp(0.8rem,2vw,0.92rem)', color: 'rgba(255,255,255,0.92)', lineHeight: 1.6 }}>
            💡 Bechne se pehle local vyapari se bhi poochho — ye wholesale mandi ka daam hai.
          </div>
        </div>
      )}

      {/* ══ DISTRICT STEP ══ */}
      {step === 'district' && crop && (
        <div style={{ position: 'relative', zIndex: 1, paddingBottom: '2rem' }}>
          <div style={{ textAlign: 'center', padding: 'clamp(1.5rem,4vw,2.5rem) 1rem clamp(1rem,3vw,1.5rem)', animation: 'fadeUp 0.5s ease both' }}>
            <span style={{ display: 'inline-block', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.85rem', fontWeight: 800, padding: '0.3rem 1rem', borderRadius: 99, marginBottom: '0.75rem', letterSpacing: '0.04em' }}>{crop.emoji} {crop.hindi} selected</span>
            <h1 style={{ fontSize: 'clamp(1.6rem,5vw,3rem)', fontWeight: 900, color: '#fff', margin: '0 0 0.4rem', letterSpacing: '-0.03em' }}>Apna District Chuniye</h1>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>19 districts · Tap to see today's price</p>
          </div>
          {/* className="km-dist-grid" */}
          <div className="km-dist-grid">
            {DISTRICTS.map((d, i) => (
              <button key={d.name} className="km-dist-card" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => { setDistrict(d.name); fetchPrices(crop, d.name) }}>
                <span style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', lineHeight: 1, marginBottom: '0.2rem', filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.3))' }}>{d.icon}</span>
                <span style={{ fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', fontWeight: 900, color: '#fff' }}>{d.name}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.tag}</span>
                <span style={{ position: 'absolute', top: '0.85rem', right: '0.9rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {step === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '6px solid #e2eed8', borderTop: '6px solid #2d6a4f', animation: 'spin 0.85s linear infinite' }} />
          <p style={{ fontWeight: 700, color: '#1b4332', fontSize: '1.1rem', margin: 0 }}>Mandi se bhav aa raha hai…</p>
          <p style={{ color: '#6b7c6b', margin: 0 }}>Thoda ruko 🙏</p>
        </div>
      )}

      {/* ══ ERROR ══ */}
      {step === 'error' && (
        <div style={{ padding: 'clamp(0.75rem,3vw,1rem)', maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(1.25rem,4vw,2rem) clamp(1rem,4vw,1.5rem)', marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            {errMsg === 'no_key' && (<><div style={{ fontSize: '3rem' }}>🔑</div><p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b4332', margin: 0 }}>API Key chahiye</p><p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>.env mein<br /><strong>NEXT_PUBLIC_DATAGOV_API_KEY</strong><br />set karo</p><a href="https://data.gov.in/user/register" target="_blank" rel="noopener noreferrer" style={{ background: '#2d6a4f', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: 14, fontSize: '1rem', fontWeight: 700, textDecoration: 'none', display: 'block', width: '100%', textAlign: 'center', border: 'none', cursor: 'pointer' }}>Free Key Lo 👉</a></>)}
            {errMsg === 'bad_key' && (<><div style={{ fontSize: '3rem' }}>⚠️</div><p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b4332', margin: 0 }}>API Key Galat Hai</p><p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>.env file mein sahi key daalo</p></>)}
            {errMsg === 'no_data' && (<><div style={{ fontSize: '3rem' }}>😕</div><p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b4332', margin: 0 }}>Data Nahi Mila</p><p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>{crop?.hindi} ka {district} mein aaj data nahi aaya.<br />Kal dobara check karo.</p></>)}
            {(errMsg === 'network' || errMsg === 'server') && (<><div style={{ fontSize: '3rem' }}>📡</div><p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b4332', margin: 0 }}>Internet Error</p><p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>Internet check karo aur dobara try karo.</p></>)}
            <button style={{ background: '#fff', border: '2px solid #2d6a4f', color: '#2d6a4f', padding: '0.85rem', borderRadius: 14, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', width: '100%' }} onClick={reset}>↩ Wapas Jao</button>
          </div>
        </div>
      )}

      {/* ══ RESULT STEP ══ */}
      {step === 'result' && best && crop && advice && (
        <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(0.75rem,3vw,1rem) clamp(0.75rem,3vw,1.5rem) 3rem', maxWidth: 1100, margin: '0 auto' }}>

          {/* Advice banner */}
          <div style={{ borderRadius: 'clamp(14px,3vw,20px)', padding: 'clamp(0.9rem,3vw,1.25rem) clamp(1rem,3vw,1.75rem)', display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem,2vw,1.25rem)', animation: 'fadeUp 0.3s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', background: advice.color, marginBottom: 0 }}>
            <span style={{ fontSize: 'clamp(1.8rem,6vw,3rem)', lineHeight: 1, flexShrink: 0 }}>{advice.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'clamp(1.2rem,4vw,1.7rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{advice.text}</div>
              <div style={{ fontSize: 'clamp(0.8rem,2vw,0.92rem)', color: 'rgba(255,255,255,0.92)', marginTop: '0.3rem', fontWeight: 500 }}>{advice.sub}</div>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>📅 {best.arrival_date}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.2rem' }}>📍 {district}</div>
            </div>
          </div>

          {/* ── Two-column grid: className="km-result-grid" triggers 1-col on mobile ── */}
          <div className="km-result-grid">

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Price hero */}
              <div style={{ background: '#fff', borderRadius: 'clamp(14px,3vw,22px)', padding: 'clamp(1rem,3vw,1.4rem)', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', animation: 'fadeUp 0.4s 0.05s ease both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: 'clamp(2rem,6vw,2.5rem)', filter: 'drop-shadow(1px 3px 6px rgba(0,0,0,0.15))' }}>{crop.emoji}</span>
                  <div>
                    <div style={{ fontSize: 'clamp(1rem,3vw,1.15rem)', fontWeight: 900, color: '#1b4332' }}>
                      {crop.hindi} <span style={{ fontWeight: 500, color: '#6b7c6b', fontSize: '0.9rem' }}>({crop.odia})</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7c6b', marginTop: '0.15rem' }}>🏪 {best.market}</div>
                  </div>
                </div>

                {/* Min / Modal / Max boxes — always 3-col */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'clamp(0.35rem,1.5vw,0.6rem)', marginBottom: '0.85rem', alignItems: 'end' }}>
                  <div style={{ background: '#f8faf5', borderRadius: 'clamp(10px,2vw,16px)', padding: 'clamp(0.6rem,2vw,0.85rem) clamp(0.25rem,1vw,0.5rem)', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
                    <div style={{ fontSize: 'clamp(0.58rem,1.8vw,0.72rem)', fontWeight: 700, color: '#6b7c6b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>⬇ Kam</div>
                    <div style={{ fontSize: 'clamp(0.9rem,3vw,1.45rem)', fontWeight: 900, lineHeight: 1.1, color: '#dc2626', wordBreak: 'break-word' }}>{priceForUnit(parseFloat(best.min_price), unitObj.kg)}</div>
                    <div style={{ fontSize: '0.62rem', color: '#9ca3af', marginTop: '0.25rem', fontWeight: 600 }}>{unitObj.label}</div>
                  </div>
                  <div style={{ background: '#f0faf4', borderRadius: 'clamp(10px,2vw,16px)', padding: 'clamp(0.6rem,2vw,0.85rem) clamp(0.25rem,1vw,0.5rem)', textAlign: 'center', borderTop: '4px solid #16a34a', boxShadow: '0 4px 16px rgba(22,163,74,0.15)' }}>
                    <div style={{ fontSize: 'clamp(0.58rem,1.8vw,0.72rem)', fontWeight: 700, color: '#6b7c6b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>✅ Aaj ka</div>
                    <div style={{ fontSize: 'clamp(1.05rem,4vw,1.9rem)', fontWeight: 900, lineHeight: 1.1, color: '#16a34a', wordBreak: 'break-word' }}>{unitPrice}</div>
                    <div style={{ fontSize: '0.62rem', color: '#9ca3af', marginTop: '0.25rem', fontWeight: 600 }}>{unitObj.label}</div>
                  </div>
                  <div style={{ background: '#f8faf5', borderRadius: 'clamp(10px,2vw,16px)', padding: 'clamp(0.6rem,2vw,0.85rem) clamp(0.25rem,1vw,0.5rem)', textAlign: 'center', borderTop: '4px solid #2d6a4f' }}>
                    <div style={{ fontSize: 'clamp(0.58rem,1.8vw,0.72rem)', fontWeight: 700, color: '#6b7c6b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>⬆ Zyada</div>
                    <div style={{ fontSize: 'clamp(0.9rem,3vw,1.45rem)', fontWeight: 900, lineHeight: 1.1, color: '#2d6a4f', wordBreak: 'break-word' }}>{priceForUnit(parseFloat(best.max_price), unitObj.kg)}</div>
                    <div style={{ fontSize: '0.62rem', color: '#9ca3af', marginTop: '0.25rem', fontWeight: 600 }}>{unitObj.label}</div>
                  </div>
                </div>

                <div style={{ fontSize: 'clamp(0.72rem,2vw,0.8rem)', color: '#6b7c6b', textAlign: 'center', borderTop: '1px solid #e8f0e4', paddingTop: '0.75rem', fontWeight: 600 }}>
                  📦 1 Quintal (100kg) = ₹{parseFloat(best.modal_price).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Other mandis */}
              {records.length > 1 && (
                <div style={{ background: '#fff', borderRadius: 'clamp(14px,3vw,22px)', padding: 'clamp(1rem,3vw,1.25rem)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', animation: 'fadeUp 0.4s 0.15s ease both' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1b4332', marginBottom: '0.75rem' }}>🏪 Baaki Mandis</div>
                  {records.slice(0, 6).map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 'clamp(0.55rem,2vw,0.8rem) clamp(0.6rem,2vw,1rem)', marginBottom: '0.4rem', background: i === 0 ? '#f0faf4' : i % 2 === 0 ? '#fafcf8' : '#fff', borderLeft: i === 0 ? '5px solid #16a34a' : '5px solid #e8f0e4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        {i === 0 && <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: 99, flexShrink: 0 }}>BEST</span>}
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1b4332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.market}</span>
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: i === 0 ? '#16a34a' : '#2d6a4f', flexShrink: 0, marginLeft: '0.5rem' }}>{priceForUnit(parseFloat(r.modal_price), unitObj.kg)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Unit selector */}
              <div style={{ background: '#fff', borderRadius: 'clamp(14px,3vw,22px)', padding: 'clamp(1rem,3vw,1.4rem)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', animation: 'fadeUp 0.4s 0.1s ease both' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1b4332', marginBottom: '1rem' }}>🧮 Kitna Bechoge?</div>
                {/* className="km-unit-grid" → 2-col on tiny phones */}
                <div className="km-unit-grid">
                  {UNITS.map((u, i) => (
                    <button key={i} onClick={() => setUnitIdx(i)} style={{ borderRadius: 12, padding: 'clamp(0.45rem,1.5vw,0.65rem) 0.3rem', fontSize: 'clamp(0.72rem,2vw,0.88rem)', cursor: 'pointer', border: '2px solid', transition: 'transform 0.12s', background: i === unitIdx ? '#1b4332' : '#f3f8f0', color: i === unitIdx ? '#fff' : '#1b4332', borderColor: i === unitIdx ? '#1b4332' : '#c8dfc0', fontWeight: i === unitIdx ? 900 : 600 }}>
                      {u.label}
                    </button>
                  ))}
                </div>
                <div style={{ background: '#f0faf4', borderRadius: 16, padding: 'clamp(0.75rem,2vw,1.1rem)', textAlign: 'center', marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7c6b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{unitObj.label} bechoge toh milega</div>
                  <div style={{ fontSize: 'clamp(2rem,6vw,3.2rem)', fontWeight: 900, color: '#1b4332', lineHeight: 1.1, margin: '0.2rem 0', letterSpacing: '-0.04em', wordBreak: 'break-word' }}>{unitPrice}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7c6b' }}>10 × = {priceForUnit(parseFloat(best.modal_price), unitObj.kg * 10)}</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href={`https://wa.me/?text=${encodeURIComponent(buildWAMsg(crop, district, best, unitObj.label, unitPrice, advice))}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', background: '#25d366', color: '#fff', padding: 'clamp(0.75rem,2.5vw,1rem)', borderRadius: 16, fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,211,102,0.3)' }}>
                  <span style={{ fontSize: '1.3rem' }}>💬</span> WhatsApp pe bhejo
                </a>
                <button onClick={() => setStep('alert_setup')} style={{ width: '100%', padding: 'clamp(0.75rem,2vw,0.9rem)', background: '#fff', border: '2px solid #f59e0b', color: '#92400e', borderRadius: 16, fontSize: 'clamp(0.85rem,2.5vw,0.95rem)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  🔔 Auto Alert Lagao
                </button>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: 'clamp(0.6rem,2vw,0.85rem) clamp(0.75rem,2vw,1rem)', fontSize: 'clamp(0.78rem,2vw,0.875rem)', color: '#92400e', lineHeight: 1.6 }}>
                  💡 Bechne se pehle local vyapari se bhi poochho — ye wholesale daam hai.
                </div>
                <button onClick={reset} style={{ width: '100%', padding: 'clamp(0.75rem,2.5vw,1rem)', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 16, fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(45,106,79,0.25)' }}>
                  🔄 Doosri Fasal Dekho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ ALERT SETUP ══ */}
      {step === 'alert_setup' && crop && (
        <div style={{ padding: 'clamp(0.75rem,3vw,1rem)', maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(1.25rem,4vw,1.75rem) clamp(1rem,4vw,1.25rem)', marginTop: '0.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem', textAlign: 'center' }}>🔔</div>
            <h2 style={{ fontSize: 'clamp(1.1rem,4vw,1.4rem)', fontWeight: 800, color: '#1b4332', margin: 0 }}>Auto Alert Lagao</h2>
            <p style={{ fontSize: 'clamp(0.85rem,2.5vw,0.95rem)', color: '#4b5563', lineHeight: 1.7, textAlign: 'center', margin: 0 }}>Jab bhi <strong>{crop.hindi}</strong> ka bhav {district} mein 5% se zyada upar ya neeche jaye, hum aapko WhatsApp pe turant batayenge.</p>
            <div style={{ width: '100%' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1b4332', display: 'block', marginBottom: '0.5rem' }}>Aapka WhatsApp Number</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e2eed8', borderRadius: 12, overflow: 'hidden' }}>
                <span style={{ background: '#f3f8f3', padding: '0.8rem 0.75rem', fontSize: '1rem', fontWeight: 700, color: '#1b4332', borderRight: '2px solid #e2eed8', flexShrink: 0 }}>+91</span>
                <input style={{ flex: 1, padding: '0.8rem', fontSize: '1.1rem', border: 'none', outline: 'none', color: '#1b4332', minWidth: 0, boxSizing: 'border-box' as const }} type="tel" placeholder="10-digit mobile number" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
            {alertSaved
              ? <div style={{ background: '#dcfce7', border: '2px solid #86efac', borderRadius: 14, padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#16a34a', lineHeight: 1.6, width: '100%' }}>✅ Alert set ho gaya!<br /><span style={{ fontSize: '0.85rem', fontWeight: 400 }}>Jab {crop.hindi} ka bhav 5%+ badlega, tab WhatsApp pe message ayega.</span></div>
              : <button style={{ background: '#2d6a4f', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: 14, fontSize: '1rem', fontWeight: 700, display: 'block', width: '100%', textAlign: 'center', border: 'none', cursor: phone.length === 10 ? 'pointer' : 'not-allowed', opacity: phone.length === 10 ? 1 : 0.5 }} onClick={saveAlert} disabled={phone.length !== 10}>🔔 Alert Set Karo</button>
            }
            {savedAlerts.length > 0 && (
              <div style={{ marginTop: '1.5rem', width: '100%' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7c6b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Alerts</div>
                {savedAlerts.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f8f3', borderRadius: 10, padding: '0.65rem 0.85rem', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600, color: '#1b4332', width: '100%', gap: '0.5rem' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{a.cropEmoji} {a.cropHindi} — {a.district}</span>
                    <button style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 800, cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }} onClick={() => { const updated = savedAlerts.filter((_, j) => j !== i); setSavedAlerts(updated); try { localStorage.setItem('km_alerts', JSON.stringify(updated)) } catch {} }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <button style={{ background: '#fff', border: '2px solid #2d6a4f', color: '#2d6a4f', padding: '0.85rem', borderRadius: 14, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', width: '100%' }} onClick={() => setStep('result')}>← Wapas Jao</button>
          </div>
        </div>
      )}

      {/* ══ ALL MEDIA QUERIES — classNames actually used above ══ */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        button { -webkit-tap-highlight-color: transparent; }

        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes ticker { from { transform:translateX(0) } to { transform:translateX(-50%) } }

        /* Ticker */
        .km-ticker {
          display: flex;
          white-space: nowrap;
          animation: ticker 28s linear infinite;
          will-change: transform;
        }

        /* ── CROP GRID: 4 → 3 → 2 cols ── */
        .km-crop-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(0.6rem, 2vw, 1.1rem);
          padding: 0 clamp(0.75rem, 5vw, 5vw);
          position: relative;
          z-index: 1;
        }
        @media (max-width: 900px) { .km-crop-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 560px) { .km-crop-grid { grid-template-columns: repeat(2, 1fr); } }

        .km-crop-card {
          position: relative;
          background: rgba(244,162,97,0.18);
          border: 2px solid rgba(244,162,97,0.35);
          border-radius: clamp(14px, 3vw, 22px);
          padding: clamp(1rem,3vw,1.75rem) 0.75rem clamp(0.8rem,2vw,1.25rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(244,162,97,0.15);
          animation: fadeUp 0.5s ease both;
          transition: transform 0.15s;
        }
        .km-crop-card:hover  { transform: translateY(-2px); }
        .km-crop-card:active { transform: translateY(0); }

        /* ── DISTRICT GRID ── */
        .km-dist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: clamp(0.5rem, 2vw, 0.85rem);
          padding: 0 clamp(0.75rem, 3vw, 1.5rem);
          max-width: 960px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 480px) { .km-dist-grid { grid-template-columns: repeat(2, 1fr); } }

        .km-dist-card {
          position: relative;
          background: rgba(0,0,0,0.45);
          border: 2px solid rgba(255,255,255,0.22);
          border-radius: 18px;
          padding: clamp(0.75rem,2vw,1.1rem) clamp(0.7rem,2vw,1rem);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.2rem;
          cursor: pointer;
          text-align: left;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: fadeUp 0.45s ease both;
          transition: transform 0.15s;
        }
        .km-dist-card:hover  { transform: translateY(-2px); }
        .km-dist-card:active { transform: translateY(0); }

        /* ── RESULT GRID: 2-col → 1-col at 768px ── */
        .km-result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(0.75rem, 2vw, 1.25rem);
          margin-top: 1rem;
        }
        @media (max-width: 768px) {
          .km-result-grid { grid-template-columns: 1fr; }
        }

        /* ── UNIT GRID: 3-col → 2-col on tiny phones ── */
        .km-unit-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.45rem;
        }
        @media (max-width: 380px) {
          .km-unit-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  )
}