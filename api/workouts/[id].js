import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db.js';
import { getUserIdFromRequest, unauthorized } from '../lib/auth.js';

export default async function handler(req, res) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return unauthorized(res);
  }

  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid workout ID' });
  }

  const db = await getDb();
  const workouts = db.collection('workouts');

  if (req.method === 'GET') {
    try {
      const workout = await workouts.findOne({
        _id: new ObjectId(id),
        userId
      });

      if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
      }

      res.json({
        id: workout._id.toString(),
        name: workout.name,
        date: workout.date,
        exercises: workout.exercises,
        userId: workout.userId
      });
    } catch (error) {
      console.error('Get workout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, date, exercises } = req.body;

      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (date !== undefined) updateFields.date = date;
      if (exercises !== undefined) updateFields.exercises = exercises;

      const result = await workouts.findOneAndUpdate(
        { _id: new ObjectId(id), userId },
        { $set: updateFields },
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
      console.error('Update workout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await workouts.deleteOne({
        _id: new ObjectId(id),
        userId
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Workout not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Delete workout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
