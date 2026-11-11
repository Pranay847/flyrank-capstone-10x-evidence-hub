import test from 'node:test';
import assert from 'node:assert/strict';
import { makePdf } from '../src/pdf.js';

const text = lines => makePdf(lines).toString('latin1');
const shown = pdf => [...pdf.matchAll(/^\((.*)\) Tj$/gm)].map(m => m[1]);

test('xref offsets, startxref and stream /Length are byte-accurate', () => {
  const pdf = text(['Audit (draft)', 'Requirement: report']);
  const objs = [...pdf.matchAll(/^(\d{10}) 00000 n $/gm)].map(m => Number(m[1]));
  assert.equal(objs.length, 5);
  objs.forEach((off, i) => assert.ok(pdf.startsWith(`${i + 1} 0 obj\n`, off), `object ${i + 1} offset`));
  const startxref = Number(pdf.match(/startxref\n(\d+)\n%%EOF$/)[1]);
  assert.ok(pdf.startsWith('xref\n0 6\n', startxref));
  const [, len, body] = pdf.match(/<< \/Length (\d+) >>\nstream\n([\s\S]*?)\nendstream/);
  assert.equal(Number(len), Buffer.byteLength(body));
});

test('escapes parens and backslashes, replaces non-ASCII', () => {
  assert.deepEqual(shown(text(['a(b)c\\d', 'café ✓'])), ['a\\(b\\)c\\\\d', 'caf? ?']);
});

test('wraps at 88 chars on word boundaries without emitting blank rows', () => {
  const rows = shown(text([Array(30).fill('word').join(' ')]));
  assert.ok(rows.length > 1);
  rows.forEach(r => assert.ok(r.length <= 88 && r.length > 0));
  assert.deepEqual(shown(text(['x'.repeat(100) + ' tail'])), ['x'.repeat(100), 'tail']);
});

test('caps visible output at 50 rows', () => {
  assert.equal(shown(text(Array.from({ length: 80 }, (_, i) => `line ${i}`))).length, 50);
});
