import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, district, password } = body

    if (!name || !phone || !district || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Phone number must be exactly 10 digits.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    const db = await getDb()
    const users = db.collection('users')

    const username = phone.trim()
    const existing = await users.findOne({ username })
    if (existing) {
      return NextResponse.json({ error: 'An account with this phone number already exists.' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const result = await users.insertOne({
      name: name.trim(),
      phone: phone.trim(),
      district: district.trim(),
      username,
      password: hashedPassword,
      createdAt: new Date(),
    })

    return NextResponse.json({
      message: 'Account created successfully.',
      user: { id: result.insertedId, name: name.trim(), username, phone: phone.trim(), district: district.trim() },
    }, { status: 201 })

  } catch (err) {
    console.error('[REGISTER ERROR]', err)
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 })
  }
}