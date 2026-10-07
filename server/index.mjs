import http from 'node:http';
import { pathToFileURL } from 'node:url';

const BODY_LIMIT = 32 * 1024;
const EMAIL = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/;
const cleanHeader = (value) => typeof value === 'string' && !/[\r\n\0]/.test(value);

export function validateContact(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { form: 'Enter your contact details.' };
  const errors = {};
  const limits = { name: 100, email: 254, subject: 160, message: 5000, website: 200 };
  if (Object.keys(body).some((key) => !(key in limits))) errors.form = 'Unexpected form fields.';
  for (const [key, limit] of Object.entries(limits)) {
    if (key === 'website' && body[key] === undefined) continue;
    if (typeof body[key] !== 'string' || body[key].length > limit || (key !== 'website' && !body[key].trim())) {
      errors[key] = key === 'website' ? 'Invalid form submission.' : `Enter ${key === 'email' ? 'an email address' : `a ${key}`} (${limit} characters maximum).`;
    }
  }
  for (const key of ['name', 'email', 'subject']) {
    if (typeof body[key] === 'string' && !cleanHeader(body[key])) errors[key] = 'Use a single line without control characters.';
  }
  if (typeof body.email === 'string' && !EMAIL.test(body.email.trim())) errors.email = 'Enter a valid email address.';
  if (typeof body.message === 'string' && /\0/.test(body.message)) errors.message = 'Remove invalid characters.';
  if (typeof body.website === 'string' && body.website.trim()) errors.form = 'Unable to accept this submission.';
  return Object.keys(errors).length ? errors : null;
}

function mailConfig(env) {
  const recipient = (env.CONTACT_EMAIL || 'mondalkoushick393@gmail.com').trim();
  const sender = (env.SMTP_FROM || env.SMTP_USER || recipient).trim();
  const username = (env.SMTP_USER || recipient).trim();
  const host = (env.SMTP_HOST || (recipient.toLowerCase().endsWith('@gmail.com') ? 'smtp.gmail.com' : '')).trim();
  const password = (env.SMTP_PASS || '').trim();
  const port = Number(env.SMTP_PORT || (host === 'smtp.gmail.com' ? 587 : 587));

  if (!host || !username || !password || !sender || !recipient ||
      !Number.isInteger(port) || port < 1 || port > 65535 ||
      !cleanHeader(sender) || !EMAIL.test(sender) || !cleanHeader(recipient) || !EMAIL.test(recipient)) return null;

  return {
    recipient,
    from: sender,
    smtp: { host, port, secure: env.SMTP_SECURE === 'true',
      requireTLS: env.SMTP_SECURE !== 'true',
      auth: { user: username, pass: password },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 },
  };
}

function reply(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
}

export function createContactHandler({ env = process.env, transport, now = Date.now, rateLimit = 5, windowMs = 15 * 60 * 1000, maxClients = 10000 } = {}) {
  const clients = new Map();
  const config = mailConfig(env);
  let mailer = transport;
  return async (req, res) => {
    if (req.url?.split('?')[0] !== '/api/contact') return reply(res, 404, { error: 'Not found.' });
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return reply(res, 405, { error: 'Method not allowed.' });
    }
    const expectedOrigin = env.PUBLIC_ORIGIN || `${req.socket.encrypted ? 'https' : 'http'}://${req.headers.host}`;
    if (!req.headers.origin || req.headers.origin !== expectedOrigin || req.headers['sec-fetch-site'] === 'cross-site') {
      return reply(res, 403, { error: 'This form must be submitted from this website.' });
    }
    // The direct peer is deliberate: arbitrary forwarded headers must not bypass limits.
    const ip = req.socket.remoteAddress || 'unknown';
    const time = now();
    for (const [key, entry] of clients) if (entry.reset <= time) clients.delete(key);
    let client = clients.get(ip);
    if (!client && clients.size < maxClients) {
      client = { count: 0, reset: time + windowMs };
      clients.set(ip, client);
    }
    if (!client || client.count >= rateLimit) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil(((client?.reset ?? time + windowMs) - time) / 1000))));
      return reply(res, 429, { error: 'Too many attempts. Please try again later.' });
    }
    client.count++;
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return reply(res, 415, { error: 'Send this form as JSON.' });
    if (Number(req.headers['content-length']) > BODY_LIMIT) return reply(res, 413, { error: 'Your message is too large.' });
    let body;
    try {
      let size = 0;
      const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > BODY_LIMIT) {
          reply(res, 413, { error: 'Your message is too large.' });
          return;
        }
        chunks.push(chunk);
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      if (!res.destroyed) reply(res, 400, { error: 'Invalid request. Please check your form.' });
      return;
    }
    const errors = validateContact(body);
    if (errors) return reply(res, 400, { error: 'Please check the highlighted fields.', errors });
    if (!config) return reply(res, 503, { error: 'The contact service is temporarily unavailable. Please email me directly.' });
    try {
      if (!mailer) {
        const { default: nodemailer } = await import('nodemailer');
        mailer = nodemailer.createTransport(config.smtp);
      }
      const result = await mailer.sendMail({
        from: config.from,
        to: config.recipient,
        replyTo: body.email.trim(),
        subject: `[Portfolio] ${body.subject.trim()}`,
        text: `Name: ${body.name.trim()}\nEmail: ${body.email.trim()}\n\n${body.message.trim()}`,
      });
      if (!result?.accepted?.length) throw new Error('Message not accepted');
      return reply(res, 200, { message: 'Your message has been accepted for delivery. Thank you!' });
    } catch {
      return reply(res, 502, { error: 'Your message could not be sent. Please try again later or email me directly.' });
    }
  };
}

export function createContactServer(options) {
  const handler = createContactHandler(options);
  const server = http.createServer((req, res) => {
    Promise.resolve(handler(req, res)).catch(() => {
      if (!res.headersSent) reply(res, 500, { error: 'Unable to process this request.' });
      else res.end();
    });
  });
  server.requestTimeout = 20000;
  server.headersTimeout = 10000;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.CONTACT_PORT || 8787);
  createContactServer().listen(port, process.env.CONTACT_HOST || '127.0.0.1', () => {
    console.log(`Contact API listening on port ${port}`);
  });
}
