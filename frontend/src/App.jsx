import { useEffect, useState } from 'react'
import './App.css'
import Dashboard from './Dashboard'

function App() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Continuous Security Verification</p>
        <h1 className="app-title">DevSecOps Pipeline Dashboard</h1>

        {error && <p className="error-banner">Backend not reachable: {error}</p>}
        {status && (
          <div className="live-indicator">
            <span className="live-dot" />
            <span>{status.service} — {status.status}</span>
          </div>
        )}
      </header>

      <Dashboard />
    </div>
  )
}

export default App
