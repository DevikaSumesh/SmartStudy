import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI is not defined. Using local fallback for development context.")
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/smartstudy"
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve the connection
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("smartstudy")
}

export default clientPromise
