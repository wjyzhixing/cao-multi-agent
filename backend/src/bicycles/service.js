export class BicycleService {
  constructor(repository) {
    this.repository = repository;
  }

  list(page, pageSize) {
    const { items, total } = this.repository.list((page - 1) * pageSize, pageSize);
    return { items, meta: { page, pageSize, total } };
  }

  get(id) { return this.repository.findById(id); }
  create(fields) { return this.repository.create(fields); }
  update(id, fields) { return this.repository.update(id, fields); }
  delete(id) { return this.repository.delete(id); }
}
