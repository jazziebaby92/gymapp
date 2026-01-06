import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db.js';
import { getUserIdFromRequest, unauthorized } from '../lib/auth.js';

export default async function handler(req, res) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return unauthorized(res);
  }

  const db = await getDb();
  const templates = db.collection('templates');

  if (req.method === 'GET') {
    try {
      const userTemplates = await templates
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();

      const formatted = userTemplates.map(t => ({
        id: t._id.toString(),
        name: t.name,
        exercises: t.exercises,
        userId: t.userId
      }));

      res.json(formatted);
    } catch (error) {
      console.error('Get templates error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, exercises } = req.body;

      const result = await templates.insertOne({
        name,
        exercises: exercises || [],
        userId,
        createdAt: new Date()
      });

      res.status(201).json({
        id: result.insertedId.toString(),
        name,
        exercises,
        userId
      });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
