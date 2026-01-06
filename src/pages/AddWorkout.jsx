import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DEFAULT_EXERCISES = {
  'UPPER DAY 1': [
    'Chest Press',
    'Fixed Lat Pull',
    'Deltoid Fly',
    'Tricep Dip Machine',
    'Lateral Raise',
    'Abs Machine',
    'Back Hyperextension',
    'Pull-up Machine',
  ],
  'UPPER DAY 2': [
    'Deltoid Fly (Reversed)',
    'Shoulder Press',
    'Seated Cable Row',
    'Bicep Curl',
    'Dumbbell Shrugs',
    'Incline Dumbbell',
  ],
  'LEG DAY': [
    'Romanian Dead Lifts',
    'Seated Leg Curl',
    'Leg Extension',
    'Adductor',
    'Calves',
    'Goblet Squat',
  ],
};

const SETS_OPTIONS = [1, 2, 3, 4, 5];
const REPS_OPTIONS = [6, 8, 10, 12, 15];

function AddWorkout({ token }) {
  const navigate = useNavigate();
  const [workoutType, setWorkoutType] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reorderMode, setReorderMode] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [customTemplates, setCustomTemplates] = useState([]);
  const [deleteTemplateMode, setDeleteTemplateMode] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomTemplates(data);
      }
    } catch (err) {
      console.error('Failed to fetch templates');
    }
  };

  const deleteTemplate = async (templateId) => {
    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCustomTemplates(customTemplates.filter(t => t.id !== templateId));
        setSuccessMessage('Template deleted!');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (err) {
      setError('Failed to delete template');
    }
  };

  const handleTypeChange = (type, isCustom = false) => {
    setWorkoutType(type);

    let exerciseList;
    if (isCustom) {
      const template = customTemplates.find(t => t.name === type);
      exerciseList = template ? template.exercises : [];
    } else {
      exerciseList = DEFAULT_EXERCISES[type] || [];
    }

    setExercises(
      exerciseList.map((name) => ({
        name,
        sets: 3,
        reps: 10,
        weight: '',
      }))
    );
  };

  const updateExercise = (index, field, value) => {
    setExercises(
      exercises.map((ex, i) =>
        i === index ? { ...ex, [field]: field === 'weight' ? value : (parseInt(value) || 0) } : ex
      )
    );
  };

  const moveExercise = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    const newExercises = [...exercises];
    const temp = newExercises[index];
    newExercises[index] = newExercises[newIndex];
    newExercises[newIndex] = temp;
    setExercises(newExercises);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const addExercise = () => {
    if (!newExerciseName.trim()) return;

    setExercises([
      ...exercises,
      {
        name: newExerciseName.trim(),
        sets: 3,
        reps: 10,
        weight: '',
      },
    ]);
    setNewExerciseName('');
    setShowAddModal(false);
  };

  const handleSave = async () => {
    if (!workoutName.trim()) {
      setError('Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      setError('Please add at least one exercise');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: workoutName,
          type: workoutType,
          exercises,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSuccessMessage('Successfully saved!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const allWorkoutTypes = [
    ...Object.keys(DEFAULT_EXERCISES).map(name => ({ name, isCustom: false })),
    ...customTemplates.map(t => ({ name: t.name, isCustom: true })),
  ];

  return (
    <div className="container">
      <Link to="/" className="back-btn">
        &larr; Back to Dashboard
      </Link>

      <h1 className="logo logo-small">ADD WORKOUT</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {!workoutType ? (
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Select Workout Type</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allWorkoutTypes.map(({ name, isCustom }) => {
              const template = isCustom ? customTemplates.find(t => t.name === name) : null;
              return (
                <div key={name} style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => !deleteTemplateMode && handleTypeChange(name, isCustom)}
                    disabled={deleteTemplateMode && !isCustom}
                  >
                    {name} {isCustom && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>(Custom)</span>}
                  </button>
                  {deleteTemplateMode && isCustom && template && (
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0 16px' }}
                      onClick={() => deleteTemplate(template.id)}
                    >
                      X
                    </button>
                  )}
                </div>
              );
            })}
            <Link
              to="/new-template"
              className="btn btn-success btn-full"
              style={{ marginTop: '8px' }}
            >
              + NEW TEMPLATE
            </Link>
            {customTemplates.length > 0 && (
              <button
                className={`btn ${deleteTemplateMode ? 'btn-primary' : 'btn-danger'} btn-full`}
                onClick={() => setDeleteTemplateMode(!deleteTemplateMode)}
              >
                {deleteTemplateMode ? 'DONE' : 'DELETE TEMPLATE'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Workout Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Monday Upper Session"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              {workoutType}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn ${reorderMode ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => { setReorderMode(!reorderMode); setRemoveMode(false); }}
              >
                {reorderMode ? 'Done' : 'Re-order'}
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setWorkoutType('')}
              >
                Change Type
              </button>
            </div>
          </div>

          {exercises.map((exercise, index) => (
            <div key={index} className="exercise-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (reorderMode || removeMode) ? '0' : '12px' }}>
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
                {removeMode && (
                  <button
                    className="btn btn-danger"
                    style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                    onClick={() => removeExercise(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              {!reorderMode && !removeMode && (
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
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="form-control"
                      placeholder=""
                      value={exercise.weight || ''}
                      onChange={(e) => updateExercise(index, 'weight', e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              className={`btn ${removeMode ? 'btn-primary' : 'btn-danger'}`}
              style={{ flex: 1 }}
              onClick={() => { setRemoveMode(!removeMode); setReorderMode(false); }}
            >
              {removeMode ? 'Done' : 'REMOVE'}
            </button>
            <button
              className="btn btn-success"
              style={{ flex: 1 }}
              onClick={() => setShowAddModal(true)}
              disabled={removeMode || reorderMode}
            >
              ADD
            </button>
          </div>

          <button
            className="btn btn-success btn-full"
            onClick={handleSave}
            disabled={saving || reorderMode}
            style={{ marginTop: '16px', marginBottom: '32px' }}
          >
            {saving ? 'Saving...' : 'SAVE WORKOUT'}
          </button>
        </>
      )}

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

export default AddWorkout;
