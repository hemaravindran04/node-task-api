const VALID_STATUSES = ['todo', 'in_progress', 'done'];

function validateTaskBody(req, res, next) {
  const { title, status } = req.body;
  const errors = [];

  if (req.method === 'POST' && (!title || typeof title !== 'string' || !title.trim())) {
    errors.push('title is required and must be a non-empty string');
  }

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    errors.push('title must be a non-empty string');
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  next();
}

module.exports = { validateTaskBody, VALID_STATUSES };
