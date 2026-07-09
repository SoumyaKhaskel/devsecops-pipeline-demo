import { useEffect, useState } from 'react'
import './App.css'

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
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '80px' }}>
      <h1>DevSecOps Pipeline Demo — Stage 3</h1>
      {error && <p style={{ color: 'red' }}>Backend not reachable: {error}</p>}
      {status && (
        <div>
          <p>Service: {status.service}</p>
          <p>Status: {status.status}</p>
          <p>Timestamp: {status.timestamp}</p>
        </div>
      )}
      {!status && !error && <p>Loading backend status...</p>}
    </div>
  )
}

export default App
