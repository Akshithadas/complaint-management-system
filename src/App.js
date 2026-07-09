import { useState } from 'react'
import './App.css'

function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="app">
      <nav>
        <h1>Complaint Management System</h1>
        <div className="nav-links">
          <button onClick={() => setPage('register')}>Register Complaint</button>
          <button onClick={() => setPage('track')}>Track Complaint</button>
          <button onClick={() => setPage('admin')}>Admin Panel</button>
        </div>
      </nav>

      <div className="content">
        {page === 'home' && <Home setPage={setPage} />}
        {page === 'register' && <RegisterComplaint />}
        {page === 'track' && <TrackComplaint />}
        {page === 'admin' && <AdminPanel />}
      </div>
    </div>
  )
}

function Home({ setPage }) {
  return (
    <div className="home">
      <h2>Welcome to Complaint Management System</h2>
      <p>Register and track public complaints easily</p>
      <div className="home-buttons">
        <button onClick={() => setPage('register')}>Register a Complaint</button>
        <button onClick={() => setPage('track')}>Track Your Complaint</button>
      </div>
    </div>
  )
}

function RegisterComplaint() {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Road', citizen_name: ''
  })
  const [message, setMessage] = useState('')
  const [complaintId, setComplaintId] = useState(null)

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:5000/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        setComplaintId(data.id)
        setMessage(`Complaint registered! Your ID is: ${data.id}`)
        setForm({ title: '', description: '', category: 'Road', citizen_name: '' })
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Could not connect to server')
    }
  }

  return (
    <div className="form-container">
      <h2>Register a Complaint</h2>
      <input placeholder="Your Name" value={form.citizen_name}
        onChange={e => setForm({...form, citizen_name: e.target.value})} />
      <input placeholder="Complaint Title" value={form.title}
        onChange={e => setForm({...form, title: e.target.value})} />
      <textarea placeholder="Description" value={form.description}
        onChange={e => setForm({...form, description: e.target.value})} />
      <select value={form.category}
        onChange={e => setForm({...form, category: e.target.value})}>
        <option>Road</option>
        <option>Water</option>
        <option>Electricity</option>
        <option>Sanitation</option>
      </select>
      <button onClick={handleSubmit}>Submit Complaint</button>
      {message && <p className={complaintId ? 'success' : 'error'}>{message}</p>}
    </div>
  )
}

function TrackComplaint() {
  const [id, setId] = useState('')
  const [complaint, setComplaint] = useState(null)
  const [error, setError] = useState('')

  const handleTrack = async () => {
    try {
      const res = await fetch(`http://localhost:5000/complaints/${id}`)
      const data = await res.json()
      if (res.ok) {
        setComplaint(data)
        setError('')
      } else {
        setError('Complaint not found')
        setComplaint(null)
      }
    } catch {
      setError('Could not connect to server')
    }
  }

  return (
    <div className="form-container">
      <h2>Track Your Complaint</h2>
      <input placeholder="Enter Complaint ID" value={id}
        onChange={e => setId(e.target.value)} />
      <button onClick={handleTrack}>Track</button>
      {error && <p className="error">{error}</p>}
      {complaint && (
        <div className="complaint-card">
          <h3>{complaint.title}</h3>
          <p><b>Status:</b> <span className={`status ${complaint.status.replace(' ', '-').toLowerCase()}`}>{complaint.status}</span></p>
          <p><b>Priority:</b> {complaint.priority}</p>
          <p><b>Category:</b> {complaint.category}</p>
          <p><b>Citizen:</b> {complaint.citizen_name}</p>
        </div>
      )}
    </div>
  )
}

function AdminPanel() {
  const [complaints, setComplaints] = useState([])
  const [filter, setFilter] = useState('')

  const loadComplaints = async () => {
    const url = filter
      ? `http://localhost:5000/admin/complaints?status=${filter}`
      : 'http://localhost:5000/admin/complaints'
    const res = await fetch(url)
    const data = await res.json()
    setComplaints(data)
  }

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/admin/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    loadComplaints()
  }

  const updatePriority = async (id, priority) => {
    await fetch(`http://localhost:5000/admin/complaints/${id}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority })
    })
    loadComplaints()
  }

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>
      <div className="admin-controls">
        <select onChange={e => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
        <button onClick={loadComplaints}>Load Complaints</button>
      </div>
      {complaints.length === 0 && <p>No complaints loaded yet. Click Load Complaints.</p>}
      {complaints.map(c => (
        <div key={c.id} className="complaint-card">
          <h3>#{c.id} — {c.title}</h3>
          <p><b>Citizen:</b> {c.citizen_name} | <b>Category:</b> {c.category}</p>
          <div className="admin-actions">
            <select defaultValue={c.status}
              onChange={e => updateStatus(c.id, e.target.value)}>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select defaultValue={c.priority}
              onChange={e => updatePriority(c.id, e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App