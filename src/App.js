import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [page, setPage] = useState('home')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [citizenName, setCitizenName] = useState('Anonymous')

  return (
    <div className="app">
      <nav>
        <div className="logo-container" onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">⚡</div>
          <div>
            <h1>Complaint System</h1>
          </div>
        </div>

        <div className="nav-links">
          <div className="ai-badge">
            <span className="ai-dot"></span>
            Gemini AI Active
          </div>
          <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>Home</button>
          <button className={page === 'register' ? 'active' : ''} onClick={() => setPage('register')}>Register Complaint</button>
          <button className={page === 'track' ? 'active' : ''} onClick={() => setPage('track')}>Track Complaint</button>
          <button className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}>Admin Panel</button>
        </div>
      </nav>

      <div className="content">
        {page === 'home' && <Home setPage={setPage} setIsChatOpen={setIsChatOpen} />}
        {page === 'register' && <RegisterComplaint citizenName={citizenName} setCitizenName={setCitizenName} />}
        {page === 'track' && <TrackComplaint />}
        {page === 'admin' && <AdminPanel />}
      </div>

      {/* Floating AI Chatbot FAB and Window */}
      <AIChatbot 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
        citizenName={citizenName} 
        setCitizenName={setCitizenName}
        setPage={setPage}
      />
    </div>
  )
}

function Home({ setPage, setIsChatOpen }) {
  return (
    <div className="home">
      <h2>AI-Powered Public Complaint Portal</h2>
      <p>Register, track, and manage public service complaints with instant AI categorization and real-time status updates.</p>
      <div className="home-buttons">
        <button className="btn-primary" onClick={() => setPage('register')}>📝 Register Complaint</button>
        <button className="btn-secondary" onClick={() => setPage('track')}>🔍 Track Status</button>
        <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #4da3ff, #2563eb)' }} onClick={() => setIsChatOpen(true)}>🤖 Chat with AI Assistant</button>
      </div>
    </div>
  )
}

function RegisterComplaint({ citizenName, setCitizenName }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Road', citizen_name: citizenName || ''
  })
  const [message, setMessage] = useState('')
  const [complaintId, setComplaintId] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.citizen_name.trim() || !form.title.trim() || !form.description.trim()) {
      setMessage('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        setComplaintId(data.id)
        setMessage(`Complaint successfully registered! Your Tracking ID is #${data.id}`)
        setForm({ title: '', description: '', category: 'Road', citizen_name: form.citizen_name })
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch {
      setMessage('Could not connect to backend server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2>📝 Register a Complaint</h2>
      <input 
        placeholder="Your Full Name" 
        value={form.citizen_name}
        onChange={e => {
          setForm({...form, citizen_name: e.target.value})
          setCitizenName(e.target.value)
        }} 
      />
      <input 
        placeholder="Complaint Title (e.g., Pothole on Main St)" 
        value={form.title}
        onChange={e => setForm({...form, title: e.target.value})} 
      />
      <textarea 
        placeholder="Detailed Description of the Issue..." 
        value={form.description}
        onChange={e => setForm({...form, description: e.target.value})} 
      />
      <select 
        value={form.category}
        onChange={e => setForm({...form, category: e.target.value})}
      >
        <option value="Road">Road & Highways</option>
        <option value="Water">Water Supply</option>
        <option value="Electricity">Electricity Grid</option>
        <option value="Sanitation">Sanitation & Garbage</option>
      </select>

      <button className="btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Complaint'}
      </button>

      {message && (
        <div className={complaintId ? 'success' : 'error'} style={{ marginTop: '1.25rem', padding: '0.8rem', borderRadius: '0.5rem', background: complaintId ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: complaintId ? '1px solid #10b981' : '1px solid #ef4444' }}>
          {message}
        </div>
      )}
    </div>
  )
}

function TrackComplaint() {
  const [id, setId] = useState('')
  const [complaint, setComplaint] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrack = async () => {
    if (!id.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/complaints/${id}`)
      const data = await res.json()
      if (res.ok) {
        setComplaint(data)
        setError('')
      } else {
        setError('Complaint record not found for this ID.')
        setComplaint(null)
      }
    } catch {
      setError('Could not connect to backend server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2>🔍 Track Complaint Status</h2>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <input 
          placeholder="Enter Tracking ID (e.g. 1)" 
          value={id}
          onChange={e => setId(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
        />
        <button className="btn-secondary" onClick={handleTrack} style={{ height: '48px', whiteSpace: 'nowrap' }} disabled={loading}>
          {loading ? 'Tracking...' : 'Search'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {complaint && (
        <div className="complaint-card">
          <h3>#{complaint.id} — {complaint.title}</h3>
          <p><b>Status:</b> <span className={`status ${complaint.status ? complaint.status.replace(' ', '-').toLowerCase() : 'pending'}`}>{complaint.status}</span></p>
          <p><b>Priority:</b> <span className={`priority-tag priority-${(complaint.priority || 'medium').toLowerCase()}`}>{complaint.priority}</span></p>
          <p><b>Category:</b> {complaint.category}</p>
          <p><b>Citizen Name:</b> {complaint.citizen_name}</p>
        </div>
      )}
    </div>
  )
}

function AdminPanel() {
  const [complaints, setComplaints] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)

  const loadComplaints = async () => {
    setLoading(true)
    try {
      const url = filter
        ? `/admin/complaints?status=${filter}`
        : '/admin/complaints'
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setComplaints(data)
      }
    } catch {
      console.error('Failed to fetch complaints')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await fetch(`/admin/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      loadComplaints()
    } catch (e) {
      console.error('Error updating status:', e)
    }
  }

  const updatePriority = async (id, priority) => {
    try {
      await fetch(`/admin/complaints/${id}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      })
      loadComplaints()
    } catch (e) {
      console.error('Error updating priority:', e)
    }
  }

  return (
    <div className="admin-container">
      <h2>⚙️ Admin Complaint Management</h2>
      <div className="admin-controls">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <button className="btn-primary" onClick={loadComplaints} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Complaints'}
        </button>
      </div>

      {complaints.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>No complaints loaded yet. Click "Fetch Complaints" to view records.</p>
      )}

      {complaints.map(c => (
        <div key={c.id} className="complaint-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>#{c.id} — {c.title}</h3>
            <span className={`status ${(c.status || 'open').replace(' ', '-').toLowerCase()}`}>{c.status}</span>
          </div>
          <p><b>Citizen:</b> {c.citizen_name} | <b>Category:</b> {c.category}</p>
          <div className="admin-actions">
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Update Status:</span>
              <select 
                value={c.status}
                onChange={e => updateStatus(c.id, e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Update Priority:</span>
              <select 
                value={c.priority}
                onChange={e => updatePriority(c.id, e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AIChatbot({ isOpen, setIsOpen, citizenName, setCitizenName, setPage }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI Complaint Assistant powered by Gemini. You can tell me about any civic issue (e.g. water leakage, broken streetlights) and I will register it automatically!' }
  ])
  const [inputMsg, setInputMsg] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSendMessage = async () => {
    if (!inputMsg.trim() || sending) return
    const textToSend = inputMsg.trim()
    setInputMsg('')
    
    // Add User Message
    const userMsgObj = { sender: 'user', text: textToSend }
    setMessages(prev => [...prev, userMsgObj])
    setSending(true)

    try {
      const res = await fetch('/complaints/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          citizen_name: citizenName || 'Anonymous Citizen'
        })
      })
      const data = await res.json()

      if (res.ok) {
        if (!data.is_complaint) {
          setMessages(prev => [...prev, {
            sender: 'ai',
            text: data.reply || 'Thanks for chatting!'
          }])
        } else {
          setMessages(prev => [...prev, {
            sender: 'ai',
            text: `Complaint registered automatically! Tracking ID: #${data.id}`,
            extracted: data.ai_extracted,
            complaintId: data.id
          }])
        }
      } else {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: `AI Assistant Error: ${data.error || 'Could not process request'}`
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Sorry, I lost connection to the AI backend service.'
      }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button 
        className="chatbot-fab" 
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="logo-icon" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>🤖</div>
              <div>
                <h4>Gemini AI Assistant</h4>
                <span>Online & Categorizing</span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="citizen-name-bar">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Name:</span>
            <input 
              value={citizenName} 
              onChange={e => setCitizenName(e.target.value)} 
              placeholder="Enter name for complaints"
            />
          </div>

          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-msg ${m.sender}`}>
                <p>{m.text}</p>
                {m.extracted && (
                  <div className="chat-extracted-card">
                    <p style={{ color: 'var(--primary)', fontWeight: 600 }}>Extracted Details:</p>
                    <p><b>Title:</b> {m.extracted.title}</p>
                    <p><b>Category:</b> {m.extracted.category} | <b>Priority:</b> {m.extracted.priority}</p>
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="chat-msg ai">
                <p className="ai-dot" style={{ display: 'inline-block' }}></p> <i>Analyzing message with Gemini...</i>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input 
              placeholder="Describe your issue or ask a question..." 
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="btn-primary" onClick={handleSendMessage} disabled={sending}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App