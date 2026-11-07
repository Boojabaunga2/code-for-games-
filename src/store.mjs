export class Store {
  constructor(db) {
    this.db = db;
  }
  stmt(sql, params = []) {
    return this.db.prepare(sql).bind(...params);
  }
  async get(sql, params = []) {
    return this.stmt(sql, params).first();
  }
  async all(sql, params = []) {
    return (await this.stmt(sql, params).all()).results;
  }
  async run(sql, params = []) {
    return this.stmt(sql, params).run();
  }
  async batch(statements) {
    return this.db.batch(statements.map(([s, p]) => this.stmt(s, p)));
  }
  async value(room, key, fallback = {}) {
    const r = await this.get(
      "SELECT value FROM hv_values WHERE room=? AND key=?",
      [room, key],
    );
    return r ? JSON.parse(r.value) : fallback;
  }
  async put(room, key, value) {
    return this.run(
      "INSERT INTO hv_values(room,key,value) VALUES(?,?,?) ON CONFLICT(room,key) DO UPDATE SET value=excluded.value",
      [room, key, JSON.stringify(value)],
    );
  }
  async emit(room, game, seat, kind, payload, now) {
    await this.run(
      "INSERT INTO hv_events(room,game,seat,kind,payload,created) VALUES(?,?,?,?,?,?)",
      [room, game, seat, kind, JSON.stringify(payload), now],
    );
  }
}
export function sqliteD1(database) {
  const statement = (sql, values = []) => ({
    bind(...v) {
      return statement(sql, v);
    },
    async first() {
      return database.prepare(sql).get(...values) || null;
    },
    async all() {
      return { results: database.prepare(sql).all(...values) };
    },
    runSync() {
      const r = database.prepare(sql).run(...values);
      return {
        meta: {
          changes: Number(r.changes),
          last_row_id: Number(r.lastInsertRowid),
        },
      };
    },
    async run() {
      return this.runSync();
    },
  });
  return {
    prepare: statement,
    async batch(statements) {
      database.exec("BEGIN IMMEDIATE");
      try {
        const result = [];
        for (const s of statements) result.push(s.runSync());
        database.exec("COMMIT");
        return result;
      } catch (e) {
        database.exec("ROLLBACK");
        throw e;
      }
    },
  };
}
