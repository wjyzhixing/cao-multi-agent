import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createApp } from '../src/app.js';

async function withApi(run) {
  const server = createServer(createApp());
  server.listen(0);
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await run(base); } finally { server.close(); }
}

const valid = { name: 'Roadster', brand: 'Acme', type: 'road', price: 1250 };

test('supports bicycle create, list, read, update, and delete with contract envelopes', async () => {
  await withApi(async (base) => {
    const createdResponse = await fetch(`${base}/api/bicycles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid) });
    assert.equal(createdResponse.status, 201);
    const createdEnvelope = await createdResponse.json();
    assert.deepEqual(Object.keys(createdEnvelope).sort(), ['data', 'error', 'success']);
    const created = createdEnvelope.data;
    assert.equal(createdEnvelope.success, true);
    assert.deepEqual({ name: created.name, brand: created.brand, type: created.type, price: created.price }, valid);
    assert.equal(typeof created.id, 'string');
    assert.ok(Number.isFinite(Date.parse(created.createdAt)));

    const listResponse = await fetch(`${base}/api/bicycles`);
    const listed = await listResponse.json();
    assert.equal(listResponse.status, 200);
    assert.deepEqual(listed.data, [created]);
    assert.deepEqual(listed.meta, { page: 1, pageSize: 10, total: 1 });

    const readResponse = await fetch(`${base}/api/bicycles/${created.id}`);
    assert.deepEqual((await readResponse.json()).data, created);

    const updatedFields = { ...valid, name: 'Updated' };
    const updateResponse = await fetch(`${base}/api/bicycles/${created.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(updatedFields) });
    assert.equal(updateResponse.status, 200);
    assert.equal((await updateResponse.json()).data.name, 'Updated');

    const deleteResponse = await fetch(`${base}/api/bicycles/${created.id}`, { method: 'DELETE' });
    assert.equal(deleteResponse.status, 200);
    assert.deepEqual(await deleteResponse.json(), { success: true, data: null, error: null });
  });
});

test('validates bicycle fields and pagination parameters', async () => {
  await withApi(async (base) => {
    for (const body of [{ ...valid, price: -1 }, { ...valid, name: '  ' }, { ...valid, extra: true }, { name: 'Only name' }]) {
      const response = await fetch(`${base}/api/bicycles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error.code, 'VALIDATION_ERROR');
    }
    const invalidPage = await fetch(`${base}/api/bicycles?page=0`);
    assert.equal(invalidPage.status, 400);
    assert.equal((await invalidPage.json()).error.code, 'VALIDATION_ERROR');
  });
});

test('returns contract not found envelopes for missing resources and routes', async () => {
  await withApi(async (base) => {
    for (const [url, method] of [[`${base}/api/bicycles/missing`, 'GET'], [`${base}/api/bicycles/missing`, 'PUT'], [`${base}/api/bicycles/missing`, 'DELETE'], [`${base}/unknown`, 'GET']]) {
      const response = await fetch(url, { method, ...(method === 'PUT' ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(valid) } : {}) });
      assert.equal(response.status, 404);
      const envelope = await response.json();
      assert.deepEqual({ success: envelope.success, data: envelope.data, code: envelope.error.code }, { success: false, data: null, code: 'NOT_FOUND' });
    }
  });
});

test('returns validation envelope for malformed JSON', async () => {
  await withApi(async (base) => {
    const response = await fetch(`${base}/api/bicycles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'VALIDATION_ERROR');
  });
});
