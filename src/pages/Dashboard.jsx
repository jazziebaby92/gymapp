import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard({ token, onLogout }) {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await fetch('/api/workouts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWorkouts(data);
    } catch (err) {
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutClick = (workout) => {
    if (selectedWorkout?.id === workout.id) {
      setSelectedWorkout(null);
    } else {
      setSelectedWorkout(workout);
    }
  };

  const openEditModal = () => {
    setEditName(selectedWorkout.name);
    // Convert ISO date to YYYY-MM-DD format for input
    const date = new Date(selectedWorkout.date);
    setEditDate(date.toISOString().split('T')[0]);
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editName.trim()) return;

    try {
      const res = await fetch(`/api/workouts/${selectedWorkout.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, date: editDate }),
      });

      if (!res.ok) throw new Error('Failed to update');

      setWorkouts(workouts.map(w =>
        w.id === selectedWorkout.id ? { ...w, name: editName, date: new Date(editDate).toISOString() } : w
      ));
      setShowEditModal(false);
      setSelectedWorkout(null);
    } catch (err) {
      setError('Failed to update workout');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/workouts/${selectedWorkout.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete');

      setWorkouts(workouts.filter(w => w.id !== selectedWorkout.id));
      setShowDeleteModal(false);
      setSelectedWorkout(null);
    } catch (err) {
      setError('Failed to delete workout');
    }
  };

  const handleOpen = () => {
    navigate(`/workout/${selectedWorkout.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="logo logo-small">WORKLOG</h1>
        <button className="logout-btn" onClick={onLogout}>
          Log out
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Link to="/add-workout" className="btn btn-primary btn-full">
        + ADD WORKOUT
      </Link>

      {selectedWorkout && (
        <div className="btn-group" style={{ marginTop: '16px' }}>
          <button
            className="btn btn-success"
            style={{ flex: 1 }}
            onClick={handleOpen}
          >
            EDIT
          </button>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={openEditModal}
          >
            EDIT DETAILS
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={() => setShowDeleteModal(true)}
          >
            DELETE
          </button>
        </div>
      )}

      <div className="workout-list">
        <h2 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)' }}>
          Your Workouts
        </h2>

        {loading ? (
          <div className="empty-state">
            <p>Loading...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="empty-state">
            <p>No workouts yet. Add your first one!</p>
          </div>
        ) : (
          workouts.map((workout) => (
            <div
              key={workout.id}
              className={`workout-item ${selectedWorkout?.id === workout.id ? 'selected' : ''}`}
              onClick={() => handleWorkoutClick(workout)}
              style={{ cursor: 'pointer' }}
            >
              <div className="workout-info">
                <h3>{workout.name}</h3>
                <p>{formatDate(workout.date)}</p>
              </div>
              <span className="workout-type">{workout.type}</span>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Workout</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Workout</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
              Are you sure you want to delete "{selectedWorkout?.name}"? This cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
