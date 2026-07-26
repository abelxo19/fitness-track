/*
Simple migration script: place exported Firestore collections as JSON files under
`firestore-export/` directory, named `users.json`, `workouts.json`, `meals.json`, `plans.json`, etc.

Run with:

  node scripts/migrate_firestore_to_supabase.js

Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in your environment.
This script uses the Supabase service role key to bypass row-level security during import.
*/

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const EXPORT_DIR = path.join(__dirname, '..', 'firestore-export')

const collections = ['users', 'workouts', 'meals', 'plans', 'analytics', 'reports']

async function importCollection(name) {
  const filePath = path.join(EXPORT_DIR, `${name}.json`)
  if (!fs.existsSync(filePath)) {
    console.warn(`No exported file for ${name} at ${filePath}, skipping.`)
    return
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  let docs = []
  try {
    docs = JSON.parse(raw)
  } catch (e) {
    console.error(`Failed to parse ${filePath}:`, e)
    return
  }

  if (!Array.isArray(docs)) {
    console.warn(`${filePath} does not contain an array. Expected exported Firestore documents.`)
    return
  }

  // Normalize docs: map Firestore fields to Supabase-friendly columns
  const payload = docs.map((d) => {
    // If Firestore export has `createTime` or `createdAt.seconds`, adapt accordingly
    const createdAt = d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toISOString() : d.createdAt || d.created_at || null
    const updatedAt = d.updatedAt?.seconds ? new Date(d.updatedAt.seconds * 1000).toISOString() : d.updatedAt || d.updated_at || null

    // Remove Firestore metadata fields if present
    const { __name__, __path__, id, ...rest } = d

    return { ...rest, created_at: createdAt, updated_at: updatedAt }
  })

  // Insert in batches to avoid hitting payload limits
  const BATCH_SIZE = 100
  for (let i = 0; i < payload.length; i += BATCH_SIZE) {
    const batch = payload.slice(i, i + BATCH_SIZE)
    console.log(`Inserting ${batch.length} rows into ${name}...`)
    const { error } = await supabase.from(name).insert(batch)
    if (error) {
      console.error(`Error inserting batch into ${name}:`, error)
      return
    }
  }

  console.log(`Imported ${payload.length} rows into ${name}`)
}

async function run() {
  for (const c of collections) {
    await importCollection(c)
  }
  console.log('Migration complete')
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
