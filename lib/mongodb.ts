import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const DB_NAME = process.env.MONGODB_DB || 'krishimitra'

if (!MONGODB_URI) throw new Error('MONGODB_URI is not set in environment variables')

// Cache the client promise — works correctly in Next.js serverless
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === 'development') {
  // In dev, use a global so hot-reload doesn't create multiple connections
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  const client = new MongoClient(MONGODB_URI)
  clientPromise = client.connect()
}

export async function getDb() {
  const client = await clientPromise
  return client.db(DB_NAME)
}