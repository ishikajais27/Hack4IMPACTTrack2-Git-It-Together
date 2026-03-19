'use client'
import { useState } from 'react'
import Link from 'next/link'
import ImageUpload from '../ImageUpload'

export default function LivestockPage() {
  const [result, setResult] = useState<string | null>(null)

  return (
    <div className="page">
      <Link href="/" className="page__back">
        ← Back to Home
      </Link>
      <h1 className="page__title">🐄 Livestock Health Monitor</h1>
      <p className="page__desc">
        Upload a clear photo of your animal. We'll detect early signs of illness
        and suggest treatment in Odia.
      </p>

      <div className="card">
        <ImageUpload
          apiEndpoint="/api/livestock"
          label="Upload Animal Photo"
          onResult={setResult}
        />

        {result && (
          <div className="result">
            <div className="result__title">Diagnosis</div>
            <p className="result__text">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}
