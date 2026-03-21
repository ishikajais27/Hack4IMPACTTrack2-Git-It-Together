import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Phone number and password are required.' }, { status: 400 })
    }

    const db = await getDb()
    const users = db.collection('users')

    const trimmed = username.trim()
    const user = await users.findOne({ $or: [{ username: trimmed }, { phone: trimmed }] })

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })
    }

    return NextResponse.json({
      message: 'Login successful.',
      user: { id: user._id, name: user.name, username: user.username, phone: user.phone, district: user.district },
    }, { status: 200 })

  } catch (err) {
    console.error('[LOGIN ERROR]', err)
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 })
  }
}