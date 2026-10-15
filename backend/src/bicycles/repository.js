import { randomUUID } from 'node:crypto';

export class BicycleRepository {
  #items = new Map();

  list(offset, limit) {
    const all = [...this.#items.values()];
    return { items: all.slice(offset, offset + limit), total: all.length };
  }

  findById(id) {
    return this.#items.get(id) ?? null;
  }

  create(fields) {
    const bicycle = { id: randomUUID(), ...fields, createdAt: new Date().toISOString() };
    this.#items.set(bicycle.id, bicycle);
    return bicycle;
  }

  update(id, fields) {
    const current = this.findById(id);
    if (!current) return null;
    const bicycle = { ...current, ...fields };
    this.#items.set(id, bicycle);
    return bicycle;
  }

  delete(id) {
    if (!this.#items.has(id)) return false;
    this.#items.delete(id);
    return true;
  }
}
