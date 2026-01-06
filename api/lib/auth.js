import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'worklog-secret-key-change-in-production';

export function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getUserIdFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  return decoded ? decoded.userId : null;
}

export function unauthorized(res) {
  return res.status(401).json({ error: 'Unauthorized' });
}
