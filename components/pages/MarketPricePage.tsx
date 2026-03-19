'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────
interface MandiRecord {
  district: string
  market: string
  commodity: string
  variety: string
  arrival_date: string
  min_price: string
  max_price: string
  modal_price: string
}

interface SavedAlert {
  cropApi: string
  cropHindi: string
  cropEmoji: string
  district: string
  phone: string
  lastPrice: number
  lastDate: string
}

// ─────────────────────────────────────────────────────
// CROPS
// ─────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────
// UNITS — what a farmer actually sells
// ─────────────────────────────────────────────────────
const UNITS = [
  { label: '250 gm', kg: 0.25 },
  { label: '500 gm', kg: 0.5 },
  { label: '1 Kilo', kg: 1 },
  { label: '2 Kilo', kg: 2 },
  { label: '5 Kilo', kg: 5 },
  { label: '10 Kilo', kg: 10 },
  { label: '20 Kilo', kg: 20 },
  { label: '50 Kilo', kg: 50 },
  { label: '1 Quintal (100 kg)', kg: 100 },
]
const DEFAULT_UNIT_IDX = 2 // 1 Kilo by default

const DISTRICTS = [
  'Cuttack',
  'Puri',
  'Bhubaneswar',
  'Sambalpur',
  'Berhampur',
  'Balasore',
  'Bhadrak',
  'Koraput',
  'Rayagada',
  'Ganjam',
  'Kendrapara',
  'Jajpur',
  'Dhenkanal',
  'Keonjhar',
  'Angul',
  'Sundargarh',
  'Mayurbhanj',
  'Bargarh',
  'Bolangir',
]

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────
// API gives per quintal (100kg) → convert to any unit
function priceForUnit(perQuintal: number, kg: number): string {
  const val = (perQuintal / 100) * kg
  // Show paise if < ₹1
  if (val < 1) return `${(val * 100).toFixed(0)} paise`
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 1 })}`
}

function rawPriceForUnit(perQuintal: number, kg: number): number {
  return (perQuintal / 100) * kg
}

function getAdvice(modal: number, allPrices: number[]) {
  if (allPrices.length < 2)
    return {
      emoji: '🟡',
      color: '#d97706',
      bg: '#fef3c7',
      text: 'Thoda Ruko',
      sub: 'Aur mandis ka data nahi mila. Kal dobara check karo.',
    }
  const max = Math.max(...allPrices)
  const min = Math.min(...allPrices)
  const pct = (modal - min) / (max - min || 1)
  if (pct >= 0.65)
    return {
      emoji: '🟢',
      color: '#16a34a',
      bg: '#dcfce7',
      text: 'ABHI BECHO!',
      sub: 'Aaj bhav bahut achha hai. Jaldi karo.',
    }
  if (pct >= 0.35)
    return {
      emoji: '🟡',
      color: '#d97706',
      bg: '#fef3c7',
      text: 'Thoda Ruko',
      sub: 'Bhav theek hai, par aur upar ja sakta hai.',
    }
  return {
    emoji: '🔴',
    color: '#dc2626',
    bg: '#fee2e2',
    text: 'MAT BECHO',
    sub: 'Bhav abhi bahut kam hai. Ruko.',
  }
}

// Build WhatsApp message
function buildWAMsg(
  crop: (typeof CROPS)[0],
  district: string,
  best: MandiRecord,
  unitLabel: string,
  unitPrice: string,
  advice: ReturnType<typeof getAdvice>,
): string {
  return (
    `🌾 *KrishiMitra — Aaj ka Mandi Bhav*\n\n` +
    `Fasal: ${crop.emoji} ${crop.hindi} (${crop.odia})\n` +
    `District: 📍 ${district}\n` +
    `Mandi: 🏪 ${best.market}\n\n` +
    `💰 *${unitLabel} ka bhav: ${unitPrice}*\n` +
    `📦 1 Quintal (100kg): ₹${parseFloat(best.modal_price).toLocaleString('en-IN')}\n\n` +
    `${advice.emoji} *${advice.text}*\n${advice.sub}\n\n` +
    `📅 ${best.arrival_date} | Agmarknet data\n` +
    `_KrishiMitra app se bheja gaya_`
  )
}

// ─────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────
type Step = 'crop' | 'district' | 'loading' | 'result' | 'alert_setup' | 'error'

export default function MarketPricePage() {
  const [step, setStep] = useState<Step>('crop')
  const [crop, setCrop] = useState<(typeof CROPS)[0] | null>(null)
  const [district, setDistrict] = useState('')
  const [records, setRecords] = useState<MandiRecord[]>([])
  const [errMsg, setErrMsg] = useState('')
  const [unitIdx, setUnitIdx] = useState(DEFAULT_UNIT_IDX)
  // Alert setup
  const [phone, setPhone] = useState('')
  const [alertSaved, setAlertSaved] = useState(false)
  const [savedAlerts, setSavedAlerts] = useState<SavedAlert[]>([])
  // Price check interval ref
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load saved alerts from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem('km_alerts')
      if (s) setSavedAlerts(JSON.parse(s))
    } catch {}
  }, [])

  // ── Fetch prices ─────────────────────────────────
  const fetchPrices = useCallback(
    async (c: (typeof CROPS)[0], dist: string) => {
      setStep('loading')
      setRecords([])

      const key = process.env.NEXT_PUBLIC_DATAGOV_API_KEY
      if (!key) {
        setErrMsg('no_key')
        setStep('error')
        return
      }

      try {
        const params = new URLSearchParams({
          'api-key': key,
          format: 'json',
          limit: '50',
          filters: JSON.stringify({
            State: 'Odisha',
            Commodity: c.api,
            District: dist,
          }),
        })

        const res = await fetch(
          `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}`,
        )
        if (res.status === 403) {
          setErrMsg('bad_key')
          setStep('error')
          return
        }
        if (!res.ok) {
          setErrMsg('server')
          setStep('error')
          return
        }

        const data = await res.json()
        const recs: MandiRecord[] = data.records ?? []
        if (!recs.length) {
          setErrMsg('no_data')
          setStep('error')
          return
        }

        recs.sort(
          (a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price),
        )
        setRecords(recs)
        setStep('result')
      } catch {
        setErrMsg('network')
        setStep('error')
      }
    },
    [],
  )

  // ── Save alert ──────────────────────────────────
  function saveAlert() {
    if (!crop || !phone.trim() || phone.length < 10) return
    const best = records[0]
    const alert: SavedAlert = {
      cropApi: crop.api,
      cropHindi: crop.hindi,
      cropEmoji: crop.emoji,
      district,
      phone: phone.trim(),
      lastPrice: parseFloat(best.modal_price),
      lastDate: best.arrival_date,
    }
    const updated = [
      alert,
      ...savedAlerts.filter(
        (a) => !(a.cropApi === crop.api && a.district === district),
      ),
    ]
    setSavedAlerts(updated)
    try {
      localStorage.setItem('km_alerts', JSON.stringify(updated))
    } catch {}
    setAlertSaved(true)
  }

  // ── Auto price-check every 6 hours (when page open) ──
  // If price changed by >5%, opens WhatsApp with alert message
  useEffect(() => {
    if (savedAlerts.length === 0) return
    const key = process.env.NEXT_PUBLIC_DATAGOV_API_KEY
    if (!key) return

    async function checkPrices() {
      for (const alert of savedAlerts) {
        try {
          const params = new URLSearchParams({
            'api-key': key!,
            format: 'json',
            limit: '5',
            filters: JSON.stringify({
              State: 'Odisha',
              Commodity: alert.cropApi,
              District: alert.district,
            }),
          })
          const res = await fetch(
            `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params}`,
          )
          if (!res.ok) continue
          const data = await res.json()
          const recs: MandiRecord[] = data.records ?? []
          if (!recs.length) continue

          recs.sort(
            (a, b) => parseFloat(b.modal_price) - parseFloat(a.modal_price),
          )
          const newPrice = parseFloat(recs[0].modal_price)
          const changePct =
            Math.abs((newPrice - alert.lastPrice) / alert.lastPrice) * 100

          // Notify if price changed by >5%
          if (changePct >= 5) {
            const direction =
              newPrice > alert.lastPrice ? 'BADH GAYA ↑' : 'GIRA GAYA ↓'
            const waMsg = encodeURIComponent(
              `🚨 *KrishiMitra Price Alert!*\n\n` +
                `${alert.cropEmoji} *${alert.cropHindi}* ka bhav ${direction}!\n\n` +
                `📍 District: ${alert.district}\n` +
                `🏪 Mandi: ${recs[0].market}\n\n` +
                `Pehle ka bhav: ₹${alert.lastPrice.toLocaleString('en-IN')}/qtl\n` +
                `*Aaj ka bhav: ₹${newPrice.toLocaleString('en-IN')}/qtl*\n` +
                `Badlaav: ${changePct.toFixed(1)}%\n\n` +
                `📅 ${recs[0].arrival_date}\n` +
                `_KrishiMitra app se auto-alert_`,
            )
            // Open WhatsApp to farmer's number
            window.open(
              `https://wa.me/91${alert.phone}?text=${waMsg}`,
              '_blank',
            )

            // Update stored last price
            const updated = savedAlerts.map((a) =>
              a.cropApi === alert.cropApi && a.district === alert.district
                ? { ...a, lastPrice: newPrice, lastDate: recs[0].arrival_date }
                : a,
            )
            setSavedAlerts(updated)
            try {
              localStorage.setItem('km_alerts', JSON.stringify(updated))
            } catch {}
          }
        } catch {}
      }
    }

    // Check immediately once, then every 6 hours
    checkPrices()
    checkRef.current = setInterval(checkPrices, 6 * 60 * 60 * 1000)
    return () => {
      if (checkRef.current) clearInterval(checkRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAlerts.length])

  function reset() {
    setStep('crop')
    setCrop(null)
    setDistrict('')
    setRecords([])
    setErrMsg('')
    setAlertSaved(false)
    setPhone('')
  }

  const best = records[0] ?? null
  const allModal = records.map((r) => parseFloat(r.modal_price))
  const advice = best ? getAdvice(parseFloat(best.modal_price), allModal) : null
  const unitObj = UNITS[unitIdx]
  const unitPrice = best
    ? priceForUnit(parseFloat(best.modal_price), unitObj.kg)
    : ''
  const unitRaw = best
    ? rawPriceForUnit(parseFloat(best.modal_price), unitObj.kg)
    : 0

  // ─────────────────────────────────────────────────
  return (
    <div style={S.page}>
      {/* TOP BAR */}
      <div style={S.topBar}>
        {step !== 'crop' ? (
          <button style={S.backBtn} onClick={reset}>
            ← Wapas
          </button>
        ) : (
          <div style={{ width: 72 }} />
        )}
        <div style={S.topTitle}>📈 Mandi Bhav</div>
        <div style={{ width: 72 }} />
      </div>

      {/* ══ STEP 1: CROP ══ */}
      {step === 'crop' && (
        <div style={S.container}>
          <div style={S.stepHead}>
            <div style={S.stepIcon}>🌾</div>
            <h1 style={S.stepQ}>Aapki fasal kya hai?</h1>
            <p style={S.stepHint}>Apni fasal pe tap karo 👇</p>
          </div>
          <div style={S.cropGrid}>
            {CROPS.map((c) => (
              <button
                key={c.api}
                style={S.cropCard}
                onClick={() => {
                  setCrop(c)
                  setStep('district')
                }}
              >
                <span style={S.cropEmoji}>{c.emoji}</span>
                <span style={S.cropHindi}>{c.hindi}</span>
                <span style={S.cropOdia}>{c.odia}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ STEP 2: DISTRICT ══ */}
      {step === 'district' && crop && (
        <div style={S.container}>
          <div style={S.stepHead}>
            <div style={S.stepIcon}>{crop.emoji}</div>
            <h1 style={S.stepQ}>Aapka district?</h1>
            <p style={S.stepHint}>Apne district pe tap karo 👇</p>
          </div>
          <div style={S.distList}>
            {DISTRICTS.map((d) => (
              <button
                key={d}
                style={S.distRow}
                onClick={() => {
                  setDistrict(d)
                  fetchPrices(crop, d)
                }}
              >
                <span>📍</span>
                <span style={S.distName}>{d}</span>
                <span style={{ color: '#9ca3af', fontSize: '1.3rem' }}>›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {step === 'loading' && (
        <div style={S.centered}>
          <div style={S.spinner} />
          <p
            style={{
              fontWeight: 700,
              color: '#1b4332',
              fontSize: '1.1rem',
              margin: 0,
            }}
          >
            Mandi se bhav aa raha hai…
          </p>
          <p style={{ color: '#6b7c6b', margin: 0 }}>Thoda ruko 🙏</p>
        </div>
      )}

      {/* ══ ERROR ══ */}
      {step === 'error' && (
        <div style={S.container}>
          <div style={S.errorCard}>
            {errMsg === 'no_key' && (
              <>
                <div style={S.errIcon}>🔑</div>
                <p style={S.errT}>API Key chahiye</p>
                <p style={S.errB}>
                  .env mein
                  <br />
                  <strong>NEXT_PUBLIC_DATAGOV_API_KEY</strong>
                  <br />
                  set karo
                </p>
                <a
                  href="https://data.gov.in/user/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={S.greenBtn}
                >
                  Free Key Lo 👉
                </a>
              </>
            )}
            {errMsg === 'bad_key' && (
              <>
                <div style={S.errIcon}>⚠️</div>
                <p style={S.errT}>API Key Galat Hai</p>
                <p style={S.errB}>.env file mein sahi key daalo</p>
              </>
            )}
            {errMsg === 'no_data' && (
              <>
                <div style={S.errIcon}>😕</div>
                <p style={S.errT}>Data Nahi Mila</p>
                <p style={S.errB}>
                  {crop?.hindi} ka {district} mein aaj data nahi aaya.
                  <br />
                  Kal dobara check karo.
                </p>
              </>
            )}
            {(errMsg === 'network' || errMsg === 'server') && (
              <>
                <div style={S.errIcon}>📡</div>
                <p style={S.errT}>Internet Error</p>
                <p style={S.errB}>Internet check karo aur dobara try karo.</p>
              </>
            )}
            <button style={S.outlineBtn} onClick={reset}>
              ↩ Wapas Jao
            </button>
          </div>
        </div>
      )}

      {/* ══ RESULT ══ */}
      {step === 'result' && best && crop && advice && (
        <div style={S.container}>
          {/* Advice banner */}
          <div
            style={{
              ...S.adviceBanner,
              background: advice.bg,
              borderColor: advice.color,
            }}
          >
            <span style={{ fontSize: '2.5rem', flexShrink: 0 }}>
              {advice.emoji}
            </span>
            <div>
              <div style={{ ...S.adviceText, color: advice.color }}>
                {advice.text}
              </div>
              <div
                style={{
                  fontSize: '0.88rem',
                  color: '#374151',
                  marginTop: '0.2rem',
                }}
              >
                {advice.sub}
              </div>
            </div>
          </div>

          {/* ── UNIT SELECTOR — the new key feature ── */}
          <div style={S.unitCard}>
            <div style={S.unitCardTitle}>Aap kitna bechna chahte ho?</div>
            <div style={S.unitGrid}>
              {UNITS.map((u, i) => (
                <button
                  key={i}
                  style={{
                    ...S.unitBtn,
                    background: i === unitIdx ? '#2d6a4f' : '#f3f8f3',
                    color: i === unitIdx ? '#fff' : '#1b4332',
                    border:
                      i === unitIdx ? '2px solid #2d6a4f' : '2px solid #e2eed8',
                    fontWeight: i === unitIdx ? 800 : 600,
                  }}
                  onClick={() => setUnitIdx(i)}
                >
                  {u.label}
                </button>
              ))}
            </div>

            {/* Big price for selected unit */}
            <div style={S.unitPriceBox}>
              <div style={S.unitPriceLabel}>{unitObj.label} ka mandi bhav</div>
              <div style={S.unitPriceBig}>{unitPrice}</div>
              <div style={S.unitPriceSub}>
                Agar 10 {unitObj.label} becho →{' '}
                {priceForUnit(parseFloat(best.modal_price), unitObj.kg * 10)}{' '}
                milega
              </div>
            </div>
          </div>

          {/* Price card */}
          <div style={S.priceCard}>
            <div style={S.priceTop}>
              <span style={{ fontSize: '2rem' }}>{crop.emoji}</span>
              <div>
                <div style={S.priceCrop}>
                  {crop.hindi}{' '}
                  <span style={{ fontWeight: 400, color: '#9ca3af' }}>
                    ({crop.odia})
                  </span>
                </div>
                <div style={S.priceLoc}>
                  📍 {district} &nbsp;•&nbsp; 🏪 {best.market}
                </div>
              </div>
            </div>
            <div style={S.priceRowFull}>
              <div style={S.priceBox}>
                <div style={S.priceBoxLabel}>Sabse Kam</div>
                <div style={{ ...S.priceBoxVal, color: '#dc2626' }}>
                  {priceForUnit(parseFloat(best.min_price), unitObj.kg)}
                </div>
                <div style={S.priceBoxSub}>per {unitObj.label}</div>
              </div>
              <div style={S.priceBox}>
                <div style={S.priceBoxLabel}>Aaj ka Daam</div>
                <div
                  style={{
                    ...S.priceBoxVal,
                    color: '#2d6a4f',
                    fontSize: '1.5rem',
                  }}
                >
                  {unitPrice}
                </div>
                <div style={S.priceBoxSub}>per {unitObj.label}</div>
              </div>
              <div style={S.priceBox}>
                <div style={S.priceBoxLabel}>Sabse Zyada</div>
                <div style={{ ...S.priceBoxVal, color: '#16a34a' }}>
                  {priceForUnit(parseFloat(best.max_price), unitObj.kg)}
                </div>
                <div style={S.priceBoxSub}>per {unitObj.label}</div>
              </div>
            </div>
            <div style={S.dateTag}>
              📅 {best.arrival_date} &nbsp;·&nbsp; Per quintal: ₹
              {parseFloat(best.modal_price).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Other mandis */}
          {records.length > 1 && (
            <div style={S.otherCard}>
              <div style={S.otherTitle}>
                Baaki Mandis ({unitObj.label} ka bhav)
              </div>
              {records.slice(0, 6).map((r, i) => (
                <div
                  key={i}
                  style={{
                    ...S.mandiRow,
                    background: i === 0 ? '#f0faf4' : '#fff',
                    borderLeft:
                      i === 0 ? '4px solid #16a34a' : '4px solid transparent',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    {i === 0 && '⭐ '}
                    {r.market}
                  </div>
                  <div style={{ fontWeight: 800, color: '#2d6a4f' }}>
                    {priceForUnit(parseFloat(r.modal_price), unitObj.kg)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WhatsApp share */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(buildWAMsg(crop, district, best, unitObj.label, unitPrice, advice))}`}
            target="_blank"
            rel="noopener noreferrer"
            style={S.waBtn}
          >
            <span style={{ fontSize: '1.4rem' }}>💬</span>
            Is bhav ko WhatsApp pe bhejo
          </a>

          {/* Alert setup button */}
          <button
            style={S.alertSetupBtn}
            onClick={() => setStep('alert_setup')}
          >
            🔔 Bhav badalne pe automatic alert lagao
          </button>

          {/* Tip */}
          <div style={S.tip}>
            <span>💡</span>
            <span>
              Bechne se pehle local vyapari se bhi bhav poochho. Ye wholesale
              mandi ka daam hai.
            </span>
          </div>

          <button style={S.resetBtn} onClick={reset}>
            🔄 Doosri Fasal Ka Bhav Dekho
          </button>
        </div>
      )}

      {/* ══ ALERT SETUP ══ */}
      {step === 'alert_setup' && crop && (
        <div style={S.container}>
          <div style={S.alertCard}>
            <div style={{ fontSize: '3rem', textAlign: 'center' as const }}>
              🔔
            </div>
            <h2 style={S.alertTitle}>Auto Alert Lagao</h2>
            <p style={S.alertDesc}>
              Jab bhi <strong>{crop.hindi}</strong> ka bhav {district} mein 5%
              se zyada upar ya neeche jaye, hum aapko WhatsApp pe turant
              batayenge.
            </p>

            <div style={S.alertFieldWrap}>
              <label style={S.alertLabel}>Aapka WhatsApp Number</label>
              <div style={S.phoneRow}>
                <span style={S.phonePrefix}>+91</span>
                <input
                  style={S.phoneInput}
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            {alertSaved ? (
              <div style={S.alertSuccess}>
                ✅ Alert set ho gaya!
                <br />
                <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>
                  Jab {crop.hindi} ka bhav 5%+ badlega, tab WhatsApp pe message
                  ayega.
                </span>
              </div>
            ) : (
              <button
                style={{
                  ...S.greenBtn,
                  opacity: phone.length === 10 ? 1 : 0.5,
                  cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
                }}
                onClick={saveAlert}
                disabled={phone.length !== 10}
              >
                🔔 Alert Set Karo
              </button>
            )}

            {/* Show saved alerts */}
            {savedAlerts.length > 0 && (
              <div style={{ marginTop: '1.5rem', width: '100%' }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#6b7c6b',
                    textTransform: 'uppercase' as const,
                    marginBottom: '0.5rem',
                  }}
                >
                  Active Alerts
                </div>
                {savedAlerts.map((a, i) => (
                  <div key={i} style={S.savedAlertRow}>
                    <span>
                      {a.cropEmoji} {a.cropHindi} — {a.district}
                    </span>
                    <button
                      style={S.removeBtn}
                      onClick={() => {
                        const updated = savedAlerts.filter((_, j) => j !== i)
                        setSavedAlerts(updated)
                        try {
                          localStorage.setItem(
                            'km_alerts',
                            JSON.stringify(updated),
                          )
                        } catch {}
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button style={S.outlineBtn} onClick={() => setStep('result')}>
              ← Wapas Jao
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f3f8f3',
    fontFamily: "'Segoe UI',system-ui,sans-serif",
    paddingBottom: '2rem',
  },
  topBar: {
    background: '#2d6a4f',
    padding: '0.9rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: '#fff',
    borderRadius: '10px',
    padding: '0.45rem 0.9rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  topTitle: { color: '#fff', fontWeight: 800, fontSize: '1.15rem' },
  container: { padding: '1rem', maxWidth: 520, margin: '0 auto' },
  stepHead: { textAlign: 'center' as const, marginBottom: '1.5rem' },
  stepIcon: { fontSize: '3.5rem', lineHeight: 1, marginBottom: '0.4rem' },
  stepQ: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#1b4332',
    margin: '0 0 0.3rem',
  },
  stepHint: { fontSize: '1rem', color: '#6b7c6b', margin: 0 },
  cropGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' },
  cropCard: {
    background: '#fff',
    border: '2px solid #e2eed8',
    borderRadius: '18px',
    padding: '1.25rem 0.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.35rem',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    WebkitTapHighlightColor: 'transparent',
  },
  cropEmoji: { fontSize: '2.75rem', lineHeight: 1 },
  cropHindi: { fontSize: '1rem', fontWeight: 700, color: '#1b4332' },
  cropOdia: { fontSize: '0.85rem', color: '#6b7c6b' },
  distList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem',
  },
  distRow: {
    background: '#fff',
    border: '2px solid #e2eed8',
    borderRadius: '14px',
    padding: '1rem 1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    cursor: 'pointer',
    width: '100%',
    WebkitTapHighlightColor: 'transparent',
  },
  distName: {
    flex: 1,
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#1b4332',
    textAlign: 'left' as const,
  },
  centered: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
  },
  spinner: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: '6px solid #e2eed8',
    borderTop: '6px solid #2d6a4f',
    animation: 'spin 0.85s linear infinite',
  },
  errorCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '2rem 1.5rem',
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    textAlign: 'center' as const,
  },
  errIcon: { fontSize: '3rem' },
  errT: { fontSize: '1.2rem', fontWeight: 800, color: '#1b4332', margin: 0 },
  errB: { fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.7, margin: 0 },
  greenBtn: {
    background: '#2d6a4f',
    color: '#fff',
    padding: '0.85rem 1.5rem',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 700,
    textDecoration: 'none',
    display: 'block',
    width: '100%',
    textAlign: 'center' as const,
    border: 'none',
    cursor: 'pointer',
  },
  outlineBtn: {
    background: '#fff',
    border: '2px solid #2d6a4f',
    color: '#2d6a4f',
    padding: '0.85rem',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
  },
  adviceBanner: {
    borderRadius: '18px',
    border: '2px solid',
    padding: '1.1rem 1.25rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    animation: 'fadeUp 0.3s ease',
  },
  adviceText: { fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.2 },

  // Unit selector
  unitCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '1.25rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    border: '2px solid #e2eed8',
  },
  unitCardTitle: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#1b4332',
    marginBottom: '0.85rem',
  },
  unitGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: '0.5rem',
    marginBottom: '1.1rem',
  },
  unitBtn: {
    borderRadius: '12px',
    padding: '0.6rem 0.3rem',
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
    WebkitTapHighlightColor: 'transparent',
  },
  unitPriceBox: {
    background: '#f0faf4',
    borderRadius: '14px',
    padding: '1rem',
    textAlign: 'center' as const,
  },
  unitPriceLabel: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#6b7c6b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  unitPriceBig: {
    fontSize: '3rem',
    fontWeight: 900,
    color: '#2d6a4f',
    lineHeight: 1.1,
    margin: '0.2rem 0',
  },
  unitPriceSub: { fontSize: '0.82rem', color: '#6b7c6b' },

  // Price card
  priceCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '1.25rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    border: '2px solid #e2eed8',
  },
  priceTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    marginBottom: '1rem',
  },
  priceCrop: { fontSize: '1.1rem', fontWeight: 800, color: '#1b4332' },
  priceLoc: { fontSize: '0.82rem', color: '#6b7c6b', marginTop: '0.2rem' },
  priceRowFull: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  priceBox: {
    background: '#f8faf5',
    borderRadius: '12px',
    padding: '0.65rem 0.4rem',
    textAlign: 'center' as const,
  },
  priceBoxLabel: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    marginBottom: '0.25rem',
  },
  priceBoxVal: { fontSize: '1.1rem', fontWeight: 800 },
  priceBoxSub: { fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.15rem' },
  dateTag: { fontSize: '0.72rem', color: '#9ca3af' },

  // Other mandis
  otherCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '1.1rem',
    marginBottom: '1rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
  },
  otherTitle: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#1b4332',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.65rem',
  },
  mandiRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '10px',
    padding: '0.7rem 0.85rem',
    marginBottom: '0.35rem',
  },
  waBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    background: '#25d366',
    color: '#fff',
    padding: '1rem',
    borderRadius: '16px',
    fontSize: '1.05rem',
    fontWeight: 800,
    textDecoration: 'none',
    marginBottom: '0.75rem',
    boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
  },
  alertSetupBtn: {
    width: '100%',
    padding: '0.9rem',
    background: '#fff',
    border: '2px solid #f59e0b',
    color: '#92400e',
    borderRadius: '16px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  tip: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '14px',
    padding: '0.85rem 1rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    color: '#92400e',
    lineHeight: 1.6,
  },
  resetBtn: {
    width: '100%',
    padding: '1rem',
    background: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.05rem',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(45,106,79,0.25)',
  },

  // Alert setup
  alertCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '1.75rem 1.25rem',
    marginTop: '0.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
  },
  alertTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#1b4332',
    margin: 0,
  },
  alertDesc: {
    fontSize: '0.95rem',
    color: '#4b5563',
    lineHeight: 1.7,
    textAlign: 'center' as const,
    margin: 0,
  },
  alertFieldWrap: { width: '100%' },
  alertLabel: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#1b4332',
    display: 'block',
    marginBottom: '0.5rem',
  },
  phoneRow: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #e2eed8',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  phonePrefix: {
    background: '#f3f8f3',
    padding: '0.8rem 0.75rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1b4332',
    borderRight: '2px solid #e2eed8',
    flexShrink: 0,
  },
  phoneInput: {
    flex: 1,
    padding: '0.8rem',
    fontSize: '1.1rem',
    border: 'none',
    outline: 'none',
    color: '#1b4332',
  },
  alertSuccess: {
    background: '#dcfce7',
    border: '2px solid #86efac',
    borderRadius: '14px',
    padding: '1rem',
    textAlign: 'center' as const,
    fontWeight: 700,
    color: '#16a34a',
    lineHeight: 1.6,
    width: '100%',
  },
  savedAlertRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f3f8f3',
    borderRadius: '10px',
    padding: '0.65rem 0.85rem',
    marginBottom: '0.4rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#1b4332',
    width: '100%',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: '1rem',
  },
}
