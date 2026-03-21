'use client'
import { useState, useRef, useEffect } from 'react'

// ── Types ────────────────────────────────────────────────
type MsgType = 'text' | 'audio'

interface Message {
  id: string
  from: 'bot' | 'user'
  type: MsgType
  text: string
  audioDuration?: number
  time: string
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}
function nowStr() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// ── Groq API ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Mitra — a warm, caring mental wellness companion for rural farmers in Odisha, India.

  PERSONALITY:
  - You are like a trusted elder brother/sister (bhaiya/didi), NOT a clinical therapist
  - Speak in simple Hindi (Hindustani) mixed with common Odia words
  - Use VERY simple words — no medical jargon, no complicated sentences
  - Be warm, gentle, never judgmental
  - Short replies — 2 to 4 sentences max per message
  - Use emojis occasionally to feel friendly (not excessive)
  - Always respond in the SAME language the user writes in (Hindi, Odia, or English)
  - If user seems very distressed, gently suggest iCall helpline: 9152987821

  ROLE:
  - Listen deeply. Reflect back feelings. Ask gentle follow-up questions.
  - You are a conversation partner, not a questionnaire
  - Never diagnose. Never prescribe. Never give medical advice.
  - Focus on emotional support, coping, hope

  CONTEXT:
  - Users are farmers facing crop failure, debt, loneliness, illness, family stress
  - Many have never talked to anyone about mental health
  - Your job is to make them feel heard and less alone

  START: Begin with a warm greeting and ask how their day was. Keep it very natural.`

async function callGroq(
  history: { role: string; parts: { text: string }[] }[],
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
  if (!apiKey) return 'API key nahi mili. .env mein NEXT_PUBLIC_GROQ_API_KEY set karo.'

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((h) => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts.map((p) => p.text).join(''),
    })),
  ]

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, temperature: 0.88, max_tokens: 300 }),
  })

  if (!res.ok) {
    if (res.status === 429) return 'Thoda wait karo... abhi bahut log baat kar rahe hain 😅'
    return 'Kuch gadbad ho gayi. Dobara try karo.'
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? 'Kuch samajh nahi aaya, dobara bolna.'
}

// ── TTS ───────────────────────────────────────────────────
let activeMsgId: string | null = null

function ttsPlay(msgId: string, text: string, onEnd: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  activeMsgId = msgId
  const clean = text.replace(/[^\x00-\x7F\u0900-\u097F ]/g, '')
  const utt = new SpeechSynthesisUtterance(clean)
  utt.lang = 'hi-IN'
  utt.rate = 0.88
  utt.pitch = 1.05
  utt.onend = () => { activeMsgId = null; onEnd() }
  utt.onerror = () => { activeMsgId = null; onEnd() }
  window.speechSynthesis.speak(utt)
}
function ttsPause() { window.speechSynthesis?.pause() }
function ttsStop() { activeMsgId = null; window.speechSynthesis?.cancel() }

// ── Waveform ──────────────────────────────────────────────
function Waveform({ playing }: { playing: boolean }) {
  const bars = [3, 5, 8, 5, 10, 7, 4, 9, 6, 3, 7, 5, 8, 4, 6]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 20 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 3, height: h + 2, borderRadius: 3,
          background: playing ? '#86efac' : 'rgba(134,239,172,0.3)',
          animation: playing ? `waveBar 0.8s ease-in-out ${(i * 0.07).toFixed(2)}s infinite alternate` : 'none',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  )
}

// ── Audio Bubble ──────────────────────────────────────────
function AudioBubble({ msg, isUser, playingId, onPlay, onPause }: {
  msg: Message; isUser: boolean; playingId: string | null
  onPlay: (id: string, text: string) => void; onPause: (id: string) => void
}) {
  const isPlaying = playingId === msg.id
  const dur = msg.audioDuration ?? Math.max(3, Math.ceil(msg.text.length / 12))
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.65rem 0.9rem',
      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: isUser ? 'rgba(94,234,212,0.18)' : 'rgba(255,255,255,0.1)',
      border: isUser ? '1px solid rgba(94,234,212,0.35)' : '1px solid rgba(255,255,255,0.15)',
      backdropFilter: 'blur(12px)',
      minWidth: 200,
    }}>
      <button onClick={() => isPlaying ? onPause(msg.id) : onPlay(msg.id, msg.text)} style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg,#2d6a4f,#40916c)',
        border: 'none', color: '#fff', fontSize: '0.9rem', cursor: 'pointer',
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(45,106,79,0.4)',
      }}>
        {isPlaying ? '⏸' : '▶'}
      </button>
      <Waveform playing={isPlaying} />
      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginLeft: 'auto', flexShrink: 0 }}>
        {dur}s
      </span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function MindPulsePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [recSeconds, setRecSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [pausedId, setPausedId] = useState<string | null>(null)

  const geminiHistory = useRef<{ role: string; parts: { text: string }[] }[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const recRef = useRef<any>(null)
  const recTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  function handlePlay(id: string, text: string) {
    ttsStop(); setPlayingId(id); setPausedId(null)
    ttsPlay(id, text, () => { setPlayingId(null); setPausedId(null) })
  }
  function handlePause(id: string) { ttsPause(); setPlayingId(null); setPausedId(id) }
  function handleStop() { ttsStop(); setPlayingId(null); setPausedId(null) }
  function addMsg(msg: Message) { setMessages((prev) => [...prev, msg]) }

  async function startChat() {
    setStarted(true); setLoading(true)
    const greeting = await callGroq([])
    const id = uid()
    geminiHistory.current = [{ role: 'model', parts: [{ text: greeting }] }]
    addMsg({ id, from: 'bot', type: 'text', text: greeting, time: nowStr() })
    setLoading(false)
  }

  async function sendText(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    const userMsgId = uid()
    addMsg({ id: userMsgId, from: 'user', type: 'text', text: trimmed, time: nowStr() })
    geminiHistory.current = [...geminiHistory.current, { role: 'user', parts: [{ text: trimmed }] }]
    setLoading(true)
    const reply = await callGroq(geminiHistory.current)
    geminiHistory.current = [...geminiHistory.current, { role: 'model', parts: [{ text: reply }] }]
    addMsg({ id: uid(), from: 'bot', type: 'text', text: reply, time: nowStr() })
    setLoading(false)
    inputRef.current?.focus()
  }

  async function sendVoice(transcript: string, durationSecs: number) {
    if (!transcript.trim() || loading) return
    const userMsgId = uid()
    addMsg({ id: userMsgId, from: 'user', type: 'audio', text: transcript, audioDuration: durationSecs, time: nowStr() })
    geminiHistory.current = [...geminiHistory.current, { role: 'user', parts: [{ text: transcript }] }]
    setLoading(true)
    const reply = await callGroq(geminiHistory.current)
    geminiHistory.current = [...geminiHistory.current, { role: 'model', parts: [{ text: reply }] }]
    addMsg({ id: uid(), from: 'bot', type: 'text', text: reply, time: nowStr() })
    setLoading(false)
  }

  function startMic() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Aapke phone mein voice nahi chala. Type karein.'); return }
    setRecSeconds(0)
    recTimer.current = setInterval(() => setRecSeconds((s) => s + 1), 1000)
    const rec = new SR()
    rec.lang = 'hi-IN'; rec.interimResults = false; recRef.current = rec
    const startedAt = Date.now()
    rec.onstart = () => setListening(true)
    rec.onend = () => { setListening(false); if (recTimer.current) clearInterval(recTimer.current) }
    rec.onerror = () => { setListening(false); if (recTimer.current) clearInterval(recTimer.current) }
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      const dur = Math.round((Date.now() - startedAt) / 1000)
      sendVoice(transcript, Math.max(1, dur))
    }
    rec.start()
  }

  function stopMic() {
    recRef.current?.stop()
    if (recTimer.current) clearInterval(recTimer.current)
    setListening(false)
  }

  return (
    <div style={S.page}>
      {/* ── BACKGROUND ── */}
      <div style={S.bgImg} />
      <div style={S.bgOverlay} />

      {/* ── HEADER ── */}
      <div style={S.header}>
        <div style={S.avatarWrap}>
          <div style={S.avatarCircle}>
            <span style={{ fontSize: '1.4rem' }}>🌿</span>
          </div>
          {(loading || listening) && <span style={S.onlineDot} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={S.botName}>Mitra Bot</div>
          <div style={S.botStatus}>
            {listening ? `🔴 Recording... ${recSeconds}s`
              : loading ? '✍️ Likh raha hoon...'
              : '🟢 Aapka mann ka dost'}
          </div>
        </div>
        <div style={S.freeBadge}>FREE</div>
      </div>

      {/* ── CHAT ── */}
      <div style={S.chatArea}>
        {!started && (
          <div style={S.introCard}>
            <div style={S.introGlow} />
            <span style={{ fontSize: '3.5rem', lineHeight: 1, filter: 'drop-shadow(0 0 20px rgba(94,234,212,0.6))' }}>🌿</span>
            <h2 style={S.introTitle}>Mitra Bot</h2>
            <p style={S.introText}>
              Main aapka dost hoon — ek aisa insaan jise aap kuch bhi bol sakte ho.
              <br /><br />
              Koi judge nahi karega. Koi doctor nahi. Bas sunne wala ek dost. 🙏
            </p>
            <div style={S.pillRow}>
              <span style={S.pill}>🎤 Bolo ya likho</span>
              <span style={S.pill}>🔊 Tap karke suno</span>
              <span style={S.pill}>🔒 Private</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Hindi • English • Odia — koi bhi bhasha chalegi
            </p>
            <button style={S.startBtn} onClick={startChat}>
              Baat Karo Mitra Se 👉
            </button>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.from === 'user'
          return (
            <div key={msg.id} style={{ ...S.msgRow, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              {!isUser && <div style={S.msgAvatar}>🌿</div>}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                {msg.type === 'audio' ? (
                  <AudioBubble msg={msg} isUser={isUser} playingId={playingId}
                    onPlay={handlePlay} onPause={handlePause} />
                ) : (
                  <div style={isUser ? S.userBubble : S.botBubble}>
                    {msg.text.split('\n').map((line, j, arr) => (
                      <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                    ))}
                    {!isUser && (
                      <button
                        style={{ ...S.speakerBtn, background: playingId === msg.id ? 'rgba(94,234,212,0.18)' : 'transparent' }}
                        onClick={() => playingId === msg.id ? handlePause(msg.id) : handlePlay(msg.id, msg.text)}
                      >
                        {playingId === msg.id ? '⏸ Roko' : '🔊 Suno'}
                      </button>
                    )}
                  </div>
                )}
                <div style={{ ...S.timeStamp, textAlign: isUser ? 'right' : 'left' }}>{msg.time}</div>
              </div>
            </div>
          )
        })}

        {loading && started && (
          <div style={{ ...S.msgRow, justifyContent: 'flex-start' }}>
            <div style={S.msgAvatar}>🌿</div>
            <div style={S.botBubble}>
              <div style={{ display: 'flex', gap: 5, padding: '3px 0' }}>
                {[0, 1, 2].map((i) => <span key={i} style={{ ...S.dot, animationDelay: `${i * 0.22}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      {started && (
        <>
          {listening && (
            <div style={S.recordingBar}>
              <div style={S.recDot} />
              <span style={{ fontWeight: 700, color: '#f87171' }}>Recording... {recSeconds}s</span>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>Chodo bhejne ke liye</span>
            </div>
          )}

          {!listening && (
            <div style={S.inputBar}>
              <input
                ref={inputRef}
                style={S.inputField}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendText(input)}
                placeholder="Yahan likho..."
                disabled={loading}
              />
              {input.trim() ? (
                <button style={{ ...S.roundBtn, background: 'linear-gradient(135deg,#2d6a4f,#40916c)' }}
                  onClick={() => sendText(input)} disabled={loading}>
                  ➤
                </button>
              ) : (
                <button
                  style={{ ...S.roundBtn, background: 'linear-gradient(135deg,#0f766e,#14b8a6)', fontSize: '1.3rem' }}
                  onPointerDown={startMic} onPointerUp={stopMic} onPointerLeave={stopMic}
                  disabled={loading} title="Dabake rako aur bolo">
                  🎤
                </button>
              )}
            </div>
          )}

          {listening && (
            <div style={{ ...S.inputBar, justifyContent: 'center' }}>
              <button style={{ ...S.roundBtn, background: 'linear-gradient(135deg,#dc2626,#ef4444)', width: 56, height: 56, fontSize: '1.4rem' }}
                onPointerUp={stopMic} onPointerLeave={stopMic}>
                🔴
              </button>
            </div>
          )}

          <div style={S.hint}>
            {input.trim() ? 'Enter ya ➤ dabao bhejne ke liye' : '🎤 Dabakar rako + bolo → chodo = bhejna'}
          </div>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:.3} 40%{transform:translateY(-8px);opacity:1} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes waveBar   { from{transform:scaleY(0.4)} to{transform:scaleY(1.2)} }
        @keyframes recPulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        @keyframes glowPulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
      `}</style>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },

  /* Background image — full page cover */
  bgImg: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    backgroundImage: "url('/green-bg.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  /* No overlay — show the image exactly as it is, full brightness */
  bgOverlay: {
    display: 'none',
  },

  /* ── HEADER ── */
  header: {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(15,40,20,0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(134,239,172,0.3)',
    color: '#fff',
    padding: '0.7rem 1.1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexShrink: 0,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #166534, #15803d)',
    border: '2px solid rgba(134,239,172,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px rgba(134,239,172,0.25)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 11,
    height: 11,
    borderRadius: '50%',
    background: '#4ade80',
    border: '2px solid rgba(10,30,15,0.8)',
    animation: 'pulse 1.5s infinite',
  },
  botName: {
    fontWeight: 800,
    fontSize: '1rem',
    color: '#fff',
    letterSpacing: '0.01em',
  },
  botStatus: { fontSize: '0.73rem', color: 'rgba(255,255,255,0.65)', marginTop: '0.1rem' },
  freeBadge: {
    marginLeft: 'auto',
    background: 'rgba(134,239,172,0.15)',
    border: '1px solid rgba(134,239,172,0.3)',
    color: '#86efac',
    padding: '0.2rem 0.6rem',
    borderRadius: '99px',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },

  /* ── CHAT AREA ── */
  chatArea: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem max(1rem, calc(50vw - 360px))',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },

  /* ── INTRO CARD ── */
  introCard: {
    position: 'relative',
    background: 'rgba(10,30,15,0.55)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    border: '1px solid rgba(134,239,172,0.22)',
    borderRadius: '28px',
    padding: '2.5rem 2rem',
    margin: '2rem auto',
    maxWidth: 520,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    animation: 'fadeUp 0.4s ease',
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(134,239,172,0.1)',
  },
  introGlow: {
    position: 'absolute',
    top: '-40%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    height: '200px',
    background: 'radial-gradient(ellipse, rgba(134,239,172,0.1) 0%, transparent 70%)',
    animation: 'glowPulse 3s ease-in-out infinite',
    pointerEvents: 'none',
  },
  introTitle: {
    fontSize: '1.7rem',
    fontWeight: 800,
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  introText: {
    fontSize: '0.93rem',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 1.75,
    margin: 0,
  },
  pillRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' },
  pill: {
    background: 'rgba(134,239,172,0.12)',
    border: '1px solid rgba(134,239,172,0.28)',
    borderRadius: '99px',
    padding: '0.3rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#86efac',
  },
  startBtn: {
    background: 'linear-gradient(135deg, #166534 0%, #16a34a 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    padding: '1rem 2.5rem',
    fontSize: '1.05rem',
    fontWeight: 800,
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 20px rgba(22,163,74,0.4)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    letterSpacing: '0.01em',
  },

  /* ── MESSAGES ── */
  msgRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.45rem',
    animation: 'fadeUp 0.2s ease',
  },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#166534,#15803d)',
    border: '1px solid rgba(134,239,172,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    flexShrink: 0,
    boxShadow: '0 0 8px rgba(134,239,172,0.2)',
  },
  botBubble: {
    background: 'rgba(10,30,15,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(134,239,172,0.18)',
    borderRadius: '18px 18px 18px 4px',
    padding: '0.75rem 0.95rem',
    fontSize: '0.955rem',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 1.65,
    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
  },
  userBubble: {
    background: 'rgba(22,101,52,0.45)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(134,239,172,0.3)',
    borderRadius: '18px 18px 4px 18px',
    padding: '0.75rem 0.95rem',
    fontSize: '0.955rem',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 1.65,
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  },
  speakerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.45rem',
    border: '1px solid rgba(134,239,172,0.28)',
    borderRadius: '8px',
    padding: '0.22rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#86efac',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  timeStamp: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.3)',
    marginTop: '0.2rem',
    paddingLeft: '0.2rem',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'rgba(134,239,172,0.65)',
    display: 'inline-block',
    animation: 'dotBounce 1s ease-in-out infinite',
  },

  /* ── RECORDING BAR ── */
  recordingBar: {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(15,40,20,0.8)',
    backdropFilter: 'blur(16px)',
    borderTop: '1px solid rgba(248,113,113,0.3)',
    padding: '0.65rem max(1rem, calc(50vw - 360px))',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexShrink: 0,
    color: '#fff',
  },
  recDot: {
    width: 11,
    height: 11,
    borderRadius: '50%',
    background: '#f87171',
    flexShrink: 0,
    animation: 'recPulse 1s infinite',
  },

  /* ── INPUT BAR ── */
  inputBar: {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(15,40,20,0.78)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(134,239,172,0.25)',
    padding: '0.6rem max(0.75rem, calc(50vw - 360px))',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexShrink: 0,
  },
  inputField: {
    flex: 1,
    padding: '0.75rem 1.1rem',
    borderRadius: '24px',
    border: '1px solid rgba(134,239,172,0.3)',
    fontSize: '0.95rem',
    background: 'rgba(255,255,255,0.12)',
    outline: 'none',
    color: '#fff',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)',
  },
  roundBtn: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    transition: 'transform 0.15s',
  },
  hint: {
    position: 'relative',
    zIndex: 10,
    background: 'rgba(15,40,20,0.78)',
    backdropFilter: 'blur(16px)',
    textAlign: 'center' as const,
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.45)',
    paddingBottom: '0.55rem',
    flexShrink: 0,
    letterSpacing: '0.02em',
  },
}