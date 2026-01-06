import { ObjectId } from 'mongodb';
import { getDb } from '../../lib/db.js';
import { getUserIdFromRequest, unauthorized } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return unauthorized(res);
  }

  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid workout ID' });
  }

  try {
    const { exercises } = req.body;
    const db = await getDb();
    const workouts = db.collection('workouts');

    const result = await workouts.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: { exercises } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({
      id: result._id.toString(),
      name: result.name,
      date: result.date,
      exercises: result.exercises,
      userId: result.userId
    });
  } catch (error) {
    console.error('Update exercises error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
