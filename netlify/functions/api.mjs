import * as identity from '@netlify/identity';
import {getDatabase} from '@netlify/database';
import {database} from '../../server/postgres-adapter.js';
import {handler} from '../../server/netlify-handler.js';

// Adapts the official Netlify Database pool to the small interface used by
// server/postgres-adapter.js: unsafe(sql, args) -> rows (with .count) and begin(fn).
function wrap(queryable) {
  return {
    async unsafe(sql, args = []) {
      const result = await queryable.query(sql, args);
      const rows = result.rows ?? [];
      rows.count = result.rowCount ?? rows.length;
      return rows;
    },
  };
}

let adapter;
function connect() {
  if (adapter) return adapter;
  const {pool} = getDatabase();
  const client = {
    ...wrap(pool),
    async begin(fn) {
      const conn = await pool.connect();
      try {
        await conn.query('BEGIN');
        const out = await fn(wrap(conn));
        await conn.query('COMMIT');
        return out;
      } catch (error) {
        await conn.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        conn.release();
      }
    },
  };
  adapter = database(client);
  return adapter;
}

export default handler({identity, getDatabase: connect});
export const config = {path: '/api/*'};
