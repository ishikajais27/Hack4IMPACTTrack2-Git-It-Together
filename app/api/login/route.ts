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
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Phone number and password are required.' },
        { status: 400 },
      )
    }

    const mongo = await getClient()
    const db = mongo.db(DB_NAME)
    const users = db.collection('users')

    // Register stores phone number as `username` and also as `phone` — search both
    const trimmed = username.trim()
    const user = await users.findOne({
      $or: [{ username: trimmed }, { phone: trimmed }],
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 },
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 },
      )
    }

    return NextResponse.json(
      {
        message: 'Login successful.',
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          phone: user.phone,
          district: user.district,
        },
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('[LOGIN ERROR]', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 },
    )
  }
}
