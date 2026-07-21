import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrder } from './api.mjs';

test('rejects anonymous order creation', () => {
  const response = createOrder({ items: [{ sku: 'mug' }] });
  assert.equal(response.status, 401);
  assert.equal(response.body.code, 'AUTH_REQUIRED');
});

test('returns a safe error for malformed orders', () => {
  const response = createOrder({ user: { id: 'u_42' }, items: [] });
  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    code: 'INVALID_ORDER',
    message: 'Add at least one item.'
  });
});

test('accepts an authenticated, valid order', () => {
  const response = createOrder({ user: { id: 'u_42' }, items: [{ sku: 'mug' }] });
  assert.equal(response.status, 201);
  assert.equal(response.body.state, 'accepted');
});
