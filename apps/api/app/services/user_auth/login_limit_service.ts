import config from '#config/user_auth'
import db from '@adonisjs/lucid/services/db'
import { createHash } from 'node:crypto'
import { DateTime } from 'luxon'

export type LoginLimitScope = keyof typeof config.rateLimits

export default class LoginLimitService {
  static async consume(scope: LoginLimitScope, ip: string): Promise<number | null> {
    const { limit, seconds } = config.rateLimits[scope]
    const key = createHash('sha256').update(`${scope}:${ip}`).digest('hex')
    const now = DateTime.now()
    const expiresAt = now.plus({ seconds }).toSQL({ includeOffset: false })!
    await db
      .from('user_auth_limits')
      .where('expires_at', '<', now.minus({ days: 1 }).toSQL({ includeOffset: false })!)
      .delete()
    try {
      await db
        .table('user_auth_limits')
        .insert({ key_hash: key, attempts: 0, expires_at: expiresAt })
    } catch (error) {
      if (
        !['SQLITE_CONSTRAINT_PRIMARYKEY', 'SQLITE_CONSTRAINT_UNIQUE', 'ER_DUP_ENTRY'].includes(
          (error as { code: string }).code
        )
      )
        throw error
    }
    await db
      .from('user_auth_limits')
      .where('key_hash', key)
      .where('expires_at', '<=', now.toSQL({ includeOffset: false })!)
      .update({ attempts: 0, expires_at: expiresAt })
    const updated = await db
      .from('user_auth_limits')
      .where('key_hash', key)
      .where('attempts', '<', limit)
      .where('expires_at', '>', now.toSQL({ includeOffset: false })!)
      .increment('attempts', 1)
    if (Number(updated) === 1) return null
    const row = await db.from('user_auth_limits').where('key_hash', key).first()
    const expires =
      row.expires_at instanceof Date
        ? DateTime.fromJSDate(row.expires_at)
        : DateTime.fromSQL(String(row.expires_at))
    return expires.isValid ? Math.max(1, Math.ceil(expires.diff(now, 'seconds').seconds)) : seconds
  }
}
