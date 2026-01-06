import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db.js';
import { getUserIdFromRequest, unauthorized } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return unauthorized(res);
  }

  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid template ID' });
  }

  try {
    const db = await getDb();
    const templates = db.collection('templates');

    const result = await templates.deleteOne({
      _id: new ObjectId(id),
      userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
