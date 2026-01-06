import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const SETS_OPTIONS = [1, 2, 3, 4, 5];
const REPS_OPTIONS = [6, 8, 10, 12, 15];

function WorkoutDetail({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Workout not found');
      }

      const data = await res.json();
      setWorkout(data);
      setExercises(data.exercises || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateExercise = (index, field, value) => {
    setExercises(
      exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: field === 'weight' ? value : (parseInt(value) || 0) } : ex
      )
    );
    setHasChanges(true);
  };

  const moveExercise = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    const newExercises = [...exercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[newIndex];
    newExercises[newIndex] = temp;
    setExercises(newExercises);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/workouts/${id}/exercises`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ exercises }),
      });

      if (!res.ok) {
        throw new Error('Failed to save changes');
      }

      setHasChanges(false);
      setSuccessMessage('Successfully saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !workout) {
    return (
      <div className="container">
        <Link to="/" className="back-btn">
          &larr; Back to Dashboard
        </Link>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" className="back-btn">
        &larr; Back to Dashboard
      </Link>

      <div className="card" style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{workout.name}</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
          {formatDate(workout.date)}
        </p>
        <span className="workout-type">{workout.type}</span>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)' }}>
          Exercises
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${reorderMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={() => setReorderMode(!reorderMode)}
          >
            {reorderMode ? 'Done' : 'Re-order'}
          </button>
          <button
            className="btn btn-success"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            onClick={handleSave}
            disabled={saving || reorderMode}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {exercises.map((exercise, index) => (
        <div key={index} className="exercise-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: reorderMode ? '0' : '12px' }}>
            <h4 style={{ margin: 0 }}>{exercise.name}</h4>
            {reorderMode && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 12px', fontSize: '1rem' }}
                  onClick={() => moveExercise(index, -1)}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '4px 12px', fontSize: '1rem' }}
                  onClick={() => moveExercise(index, 1)}
                  disabled={index === exercises.length - 1}
                >
                  ↓
                </button>
              </div>
            )}
          </div>
          {!reorderMode && (
            <div className="exercise-inputs">
              <div className="form-group">
                <label>Sets</label>
                <select
                  className="form-control"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                >
                  {SETS_OPTIONS.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Reps</label>
                <select
                  className="form-control"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                >
                  {REPS_OPTIONS.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Weight (lbs)</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  max="200"
                  step="10"
                  value={exercise.weight || ''}
                  onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default WorkoutDetail;
