import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function NewTemplate({ token }) {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const addExercise = () => {
    if (!newExerciseName.trim()) return;

    setExercises([...exercises, newExerciseName.trim()]);
    setNewExerciseName('');
    setShowAddModal(false);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    if (exercises.length === 0) {
      setError('Please add at least one exercise');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: templateName.trim().toUpperCase(),
          exercises,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save template');
      }

      setSuccessMessage('Template saved successfully!');
      setTimeout(() => {
        navigate('/add-workout');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <Link to="/add-workout" className="back-btn">
        &larr; Back to Add Workout
      </Link>

      <h1 className="logo logo-small">NEW TEMPLATE</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="card">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Template Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., PUSH DAY"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
        Exercises ({exercises.length})
      </h2>

      {exercises.length === 0 ? (
        <div className="empty-state" style={{ padding: '20px' }}>
          <p>No exercises yet. Add your first one!</p>
        </div>
      ) : (
        exercises.map((exercise, index) => (
          <div key={index} className="exercise-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>{exercise}</h4>
            <button
              className="btn btn-danger"
              style={{ padding: '4px 12px', fontSize: '0.85rem' }}
              onClick={() => removeExercise(index)}
            >
              -
            </button>
          </div>
        ))
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button
          className="btn btn-success"
          style={{ flex: 1 }}
          onClick={() => setShowAddModal(true)}
        >
          + ADD
        </button>
      </div>

      <button
        className="btn btn-success btn-full"
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: '16px', marginBottom: '32px' }}
      >
        {saving ? 'Saving...' : 'SAVE TEMPLATE'}
      </button>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Exercise</h2>
            <div className="form-group">
              <label>Exercise Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Bench Press"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newExerciseName.trim()) {
                    addExercise();
                  }
                }}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => { setShowAddModal(false); setNewExerciseName(''); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                style={{ flex: 1 }}
                onClick={addExercise}
                disabled={!newExerciseName.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewTemplate;
