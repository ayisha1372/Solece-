import jwt from 'jsonwebtoken';
export default function auth(req, res, next) {
  try {
    req.admin = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Unauthorised' }); }
}
