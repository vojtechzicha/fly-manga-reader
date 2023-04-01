import { MongoClient } from 'mongodb'

const { MONGO_URL, MONGO_DB } = process.env
if (!MONGO_URL) throw new Error('Missing Mongo URL in environment variables.')
if (!MONGO_DB) throw new Error('Missing Mongo database in environment variables.')

let db = null
if (global.__db === undefined) {
  global.__db = null
}

if (process.env.NODE_ENV === 'production') {
  console.log('MONGODB Connecting')
  db = new MongoClient(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  db.connect()
} else {
  if (!global.__db) {
    console.log('MONGODB Connecting')
    global.__db = new MongoClient(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    global.__db.connect()
  }
  db = global.__db
}

export const chaptersCollection = db.db(MONGO_DB).collection('chapters')
export const mangasCollection = db.db(MONGO_DB).collection('mangas')
export const session = db.startSession()
