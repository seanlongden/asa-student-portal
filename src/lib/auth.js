import crypto from 'crypto';

const SECRET = process.env.MAGIC_LINK_SECRET || process.env.STRIPE_SECRET_KEY || 'dev-secret';

export function generateMagicToken(email) {
  const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  const payload = Buffer.from(`${email}:${expiry}`).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

export function verifyMagicToken(token) {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex');

    // Timing-safe comparison
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const decoded = Buffer.from(payload, 'base64url').toString();
    const lastColon = decoded.lastIndexOf(':');
    const email = decoded.substring(0, lastColon);
    const expiry = parseInt(decoded.substring(lastColon + 1));

    if (Date.now() > expiry) return null;

    return email;
  } catch {
    return null;
  }
}
