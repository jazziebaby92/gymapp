import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db.js';
import { getUserIdFromRequest, unauthorized } from '../lib/auth.js';

export default async function handler(req, res) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return unauthorized(res);
  }

  const db = await getDb();
  const workouts = db.collection('workouts');

  if (req.method === 'GET') {
    try {
      const userWorkouts = await workouts
        .find({ userId })
        .sort({ date: -1 })
        .toArray();

      const formatted = userWorkouts.map(w => ({
        id: w._id.toString(),
        name: w.name,
        date: w.date,
        exercises: w.exercises,
        userId: w.userId
      }));

      res.json(formatted);
    } catch (error) {
      console.error('Get workouts error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, date, exercises } = req.body;

      const result = await workouts.insertOne({
        name,
        date: date || new Date().toISOString().split('T')[0],
        exercises: exercises || [],
        userId,
        createdAt: new Date()
      });

      res.status(201).json({
        id: result.insertedId.toString(),
        name,
        date,
        exercises,
        userId
      });
    } catch (error) {
      console.error('Create workout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
