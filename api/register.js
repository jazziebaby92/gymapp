import bcrypt from 'bcryptjs';
import { getDb } from './lib/db.js';
import { createToken } from './lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = await getDb();
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      createdAt: new Date()
    });

    const token = createToken(result.insertedId.toString());
    res.status(201).json({ token, userId: result.insertedId.toString() });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
