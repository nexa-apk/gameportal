import fs from 'fs'
import path from 'path'
import type { Database, SqlValue } from 'sql.js'

const DB_PATH = '/opt/gameportal/data/scores.db'
const WASM_PATH = path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm')

let _db: Database | null = null

async function getDb(): Promise<Database> {
  if (_db) return _db

  const initSqlJs = (await import('sql.js')).default
  const SQL = await initSqlJs({ locateFile: () => WASM_PATH })

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH)
    _db = new SQL.Database(buf)
  } else {
    _db = new SQL.Database()
    _db.run(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_slug TEXT NOT NULL,
        player_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_scores_slug ON scores(game_slug);
      CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC);
    `)
    persist(_db)
  }

  return _db
}

function persist(db: Database) {
  const data = db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

export type ScoreRow = {
  id: number
  game_slug: string
  player_name: string
  score: number
  created_at: string
}

function parseRow(obj: Record<string, SqlValue>): ScoreRow {
  return {
    id: Number(obj.id),
    game_slug: String(obj.game_slug ?? ''),
    player_name: String(obj.player_name ?? ''),
    score: Number(obj.score),
    created_at: String(obj.created_at ?? ''),
  }
}

function queryAll(db: Database, sql: string, params: (string | number)[] = []): ScoreRow[] {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows: ScoreRow[] = []
  while (stmt.step()) {
    rows.push(parseRow(stmt.getAsObject() as Record<string, SqlValue>))
  }
  stmt.free()
  return rows
}

function queryFirst(db: Database, sql: string, params: (string | number)[] = []): Record<string, SqlValue> | null {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const result = stmt.step() ? (stmt.getAsObject() as Record<string, SqlValue>) : null
  stmt.free()
  return result
}

export async function insertScore(
  game_slug: string,
  player_name: string,
  score: number
): Promise<ScoreRow> {
  const db = await getDb()
  db.run('INSERT INTO scores (game_slug, player_name, score) VALUES (?, ?, ?)', [
    game_slug,
    player_name,
    score,
  ])
  const row = queryFirst(db, 'SELECT * FROM scores WHERE rowid = last_insert_rowid()')
  persist(db)
  return parseRow(row ?? { id: 0, game_slug, player_name, score, created_at: '' })
}

export async function getTopScoresBySlug(game_slug: string, limit = 10): Promise<ScoreRow[]> {
  const db = await getDb()
  return queryAll(db, 'SELECT * FROM scores WHERE game_slug = ? ORDER BY score DESC LIMIT ?', [
    game_slug,
    limit,
  ])
}

export async function getTopScoresAllGames(limit = 50): Promise<ScoreRow[]> {
  const db = await getDb()
  return queryAll(db, 'SELECT * FROM scores ORDER BY score DESC LIMIT ?', [limit])
}

export async function getRankForScore(game_slug: string, score: number): Promise<number> {
  const db = await getDb()
  const row = queryFirst(
    db,
    'SELECT COUNT(*) as cnt FROM scores WHERE game_slug = ? AND score > ?',
    [game_slug, score]
  )
  return Number(row?.cnt ?? 0) + 1
}
