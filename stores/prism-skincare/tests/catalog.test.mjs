import assert from 'node:assert/strict';
import test from 'node:test';

import { PRODUCTS } from '../src/data/products.js';

test('catalog identifiers are unique and stable', () => {
  const ids = PRODUCTS.map((product) => product.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(Boolean));
});

test('every product has usable pricing and presentation data', () => {
  for (const product of PRODUCTS) {
    assert.ok(product.name);
    assert.ok(Number.isFinite(product.price) && product.price > 0);
    assert.ok(product.image);
    if (product.sizes) {
      assert.ok(product.sizes.every((option) => option.size && option.price > 0));
    }
  }
});
