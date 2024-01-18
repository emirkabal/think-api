import type { Redis } from "ioredis"
import connection from "../utils/connection"

export default class User {
  userId: string
  db: Redis
  history: HistoryItem[]
  key: string

  constructor(userId: string) {
    this.db = connection
    this.userId = userId
    this.history = []
    this.key = `ai:${userId}`
  }

  async getHistory(): Promise<HistoryItem[]> {
    const dbValue = await this.db.get(this.key)
    const history = (dbValue ? JSON.parse(dbValue) : []) as HistoryItem[]
    this.history = history
    return history
  }

  async set(history: HistoryItem[]): Promise<void> {
    await this.db.set(this.key, JSON.stringify(history))
    this.history = history
  }

  async clear(): Promise<void> {
    await this.db.del(this.key)
    this.history = []
  }

  append(history: HistoryItem[]): void {
    const currentHistory = this.history

    if (currentHistory.length >= 48) currentHistory.splice(2)

    const newHistory = [...currentHistory, ...history]

    this.history = newHistory
  }

  async save(): Promise<void> {
    await this.set(this.history)
  }
}
