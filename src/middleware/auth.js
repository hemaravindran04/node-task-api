// Minimal API-key auth. Swap for JWT/OAuth in a real deployment —
// this is intentionally simple so the middleware chain is easy to follow.
function requireApiKey(req, res, next) {
  const expected = process.env.API_KEY || 'dev-key';
  const provided = req.header('x-api-key');

  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid x-api-key header' });
  }

  next();
}

module.exports = { requireApiKey };
