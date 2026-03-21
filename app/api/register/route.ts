import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI as string
const DB_NAME = process.env.MONGODB_DB || 'krishimitra'

let client: MongoClient | null = null

async function getClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
  }
  return client
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, district, password } = await req.json()

    if (!name || !phone || !district || !password) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 },
      )
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Phone number must be exactly 10 digits.' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 },
      )
    }

    const mongo = await getClient()
    const db = mongo.db(DB_NAME)
    const users = db.collection('users')

    // Use phone number as the unique username
    const username = phone.trim()

    const existing = await users.findOne({ username })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists.' },
        { status: 409 },
      )
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

    return NextResponse.json(
      {
        message: 'Account created successfully.',
        user: {
          id: result.insertedId,
          name: name.trim(),
          username,
          phone: phone.trim(),
          district: district.trim(),
        },
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[REGISTER ERROR]', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 },
    )
  }
}
