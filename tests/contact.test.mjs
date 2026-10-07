import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactServer, validateContact } from '../server/index.mjs';

const message = { name: 'Test Person', email: 'visitor@example.org', subject: 'A project', message: 'Hello, I would like to collaborate.', website: '' };
const env = { PUBLIC_ORIGIN: 'https://portfolio.example', SMTP_HOST: 'smtp.example', SMTP_PORT: '587', SMTP_USER: 'test', SMTP_PASS: 'test-secret', SMTP_FROM: 'sender@example.org' };

async function setup(t, options = {}) {
  const server = createContactServer({ env, ...options });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}/api/contact`;
  return (body = message, headers = {}) => fetch(url, { method: 'POST', headers: { origin: env.PUBLIC_ORIGIN, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
}

test('validates fields, lengths, header injection, unknown properties and honeypot', () => {
  assert.equal(validateContact(message), null);
  for (const body of [null, [], {}, { ...message, email: 'bad' }, { ...message, name: 'x'.repeat(101) }, { ...message, subject: 'hello\r\nBcc: victim@example.org' }, { ...message, message: 'x'.repeat(5001) }, { ...message, website: 'bot.example' }, { ...message, to: 'other@example.org' }]) {
    assert.ok(validateContact(body));
  }
});

test('sends only to configured recipient with visitor Reply-To and truthful acceptance', async (t) => {
  let sent;
  const post = await setup(t, { transport: { sendMail: async (mail) => { sent = mail; return { accepted: [mail.to] }; } } });
  assert.equal((await post()).status, 200);
  assert.equal(sent.to, 'mondalkoushick393@gmail.com');
  assert.equal(sent.from, 'sender@example.org');
  assert.equal(sent.replyTo, message.email);
  assert.equal(sent.html, undefined);
  assert.ok(sent.text.includes(message.message));
});

test('unconfigured API returns 503 without fake success', async (t) => {
  const post = await setup(t, { env: { PUBLIC_ORIGIN: env.PUBLIC_ORIGIN } });
  assert.equal((await post()).status, 503);
});

test('SMTP failure is generic and rejection is never success', async (t) => {
  const post = await setup(t, { transport: { sendMail: async () => { throw new Error('test-secret'); } } });
  const response = await post();
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes('test-secret'));
  const rejectPost = await setup(t, { transport: { sendMail: async () => ({ accepted: [] }) } });
  assert.equal((await rejectPost()).status, 502);
});

test('rejects cross-origin, invalid fields, oversized body and wrong content type', async (t) => {
  const post = await setup(t);
  assert.equal((await post(message, { origin: 'https://evil.example' })).status, 403);
  assert.equal((await post(message, { origin: '' })).status, 403);
  assert.equal((await post({ ...message, email: 'invalid' })).status, 400);
  assert.equal((await post({ ...message, message: 'a'.repeat(33000) })).status, 413);
  assert.equal((await post(message, { 'Content-Type': 'text/plain' })).status, 415);
});

test('rate limit counts failed attempts and expires', async (t) => {
  let time = 1000;
  const post = await setup(t, { rateLimit: 2, windowMs: 100, now: () => time });
  assert.equal((await post({})).status, 400);
  assert.equal((await post({})).status, 400);
  const limited = await post({});
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), '1');
  time += 101;
  assert.equal((await post({})).status, 400);
});
