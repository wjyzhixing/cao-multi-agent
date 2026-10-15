import { Router } from 'express';

const success = (data) => ({ success: true, data, error: null });
const failure = (res, status, code, message) => res.status(status).json({ success: false, data: null, error: { code, message } });
const fields = ['name', 'brand', 'type', 'price'];

function validateBicycle(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Body must be an object';
  if (Object.keys(body).length !== fields.length || fields.some((field) => !Object.hasOwn(body, field))) {
    return 'Body must contain name, brand, type, and price only';
  }
  for (const field of ['name', 'brand', 'type']) {
    if (typeof body[field] !== 'string' || body[field].trim().length === 0) return `${field} must be a non-empty string`;
  }
  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) return 'price must be a number greater than or equal to 0';
  return null;
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function createBicycleRouter(service) {
  const router = Router();

  router.get('/', (req, res) => {
    const page = parsePositiveInteger(req.query.page, 1);
    const pageSize = parsePositiveInteger(req.query.pageSize, 10);
    if (page === null || pageSize === null || pageSize > 100) return failure(res, 400, 'VALIDATION_ERROR', 'page and pageSize must be positive integers; pageSize cannot exceed 100');
    const result = service.list(page, pageSize);
    return res.json({ ...success(result.items), meta: result.meta });
  });

  router.get('/:id', (req, res) => {
    const bicycle = service.get(req.params.id);
    return bicycle ? res.json(success(bicycle)) : failure(res, 404, 'NOT_FOUND', 'Bicycle not found');
  });

  router.post('/', (req, res) => {
    const invalid = validateBicycle(req.body);
    if (invalid) return failure(res, 400, 'VALIDATION_ERROR', invalid);
    return res.status(201).json(success(service.create({ name: req.body.name.trim(), brand: req.body.brand.trim(), type: req.body.type.trim(), price: req.body.price })));
  });

  router.put('/:id', (req, res) => {
    const invalid = validateBicycle(req.body);
    if (invalid) return failure(res, 400, 'VALIDATION_ERROR', invalid);
    const bicycle = service.update(req.params.id, { name: req.body.name.trim(), brand: req.body.brand.trim(), type: req.body.type.trim(), price: req.body.price });
    return bicycle ? res.json(success(bicycle)) : failure(res, 404, 'NOT_FOUND', 'Bicycle not found');
  });

  router.delete('/:id', (req, res) => service.delete(req.params.id)
    ? res.json(success(null))
    : failure(res, 404, 'NOT_FOUND', 'Bicycle not found'));

  return router;
}
