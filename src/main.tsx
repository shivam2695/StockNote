import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Entry, addEntry, getEntries } from "./api";
import "./index.css";

const App = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getEntries().then(setEntries);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: Entry = {
      title,
      notes,
      date: new Date().toISOString(),
    };
    const saved = await addEntry(newEntry);
    setEntries((prev) => [...prev, saved]);
    setTitle("");
    setNotes("");
  };

  return (
    <div className="container">
      <h1>📓 Stock Journal</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Stock Title"
          required
        />
        <br />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          required
        />
        <br />
        <button type="submit">Add Entry</button>
      </form>

      <h2>🗂️ Previous Entries</h2>
      {entries.map((entry, idx) => (
        <div key={idx} className="entry">
          <strong>{entry.title}</strong>
          <p>{entry.notes}</p>
          <small>{new Date(entry.date).toLocaleString()}</small>
          <hr />
        </div>
      ))}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
