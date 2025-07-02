import React from 'react';
import './NotesView.css';

const NotesView = ({ onClose }) => {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];

  return (
    <div className="tab-modal">
      <div className="tab-header">
        <h3>Notes</h3>
        <button onClick={onClose}>✖</button>
      </div>
      <div className="tab-content">
        {notes.length === 0 ? (
          <p>No notes added yet.</p>
        ) : (
          <ul>
            {notes.map((note, index) => (
              <li key={index}>
                <strong>{note.title}</strong>
                <br />
                <p>{note.content}</p>
                <small>{note.date}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotesView;