'use client'
import { useState } from 'react'
import Link from 'next/link'
import ImageUpload from '../ImageUpload'

export default function CropPage() {
  const [result, setResult] = useState<string | null>(null)

  return (
    <div className="page">
      <Link href="/" className="page__back">
        ← Back to Home
      </Link>
      <h1 className="page__title">🌾 Crop Doctor</h1>
      <p className="page__desc">
        Upload a photo of the diseased leaf or crop. Get the disease name and
        exact treatment steps instantly.
      </p>

      <div className="card">
        <ImageUpload
          apiEndpoint="/api/crop"
          label="Upload Crop Photo"
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
