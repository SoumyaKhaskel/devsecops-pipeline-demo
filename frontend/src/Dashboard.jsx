import { useEffect, useState } from 'react'

const SEVERITY_COLOR = {
  CRITICAL: '#EF4444',
  HIGH: '#F5A623',
  ERROR: '#F5A623',
  MEDIUM: '#8B93A7',
  WARNING: '#8B93A7',
  LOW: '#2DD4BF',
  INFO: '#2DD4BF',
}

function scoreColor(score) {
  if (score >= 90) return '#2DD4BF'
  if (score >= 70) return '#F5A623'
  return '#EF4444'
}

function RadialGauge({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = scoreColor(score)

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#253045" strokeWidth="10" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="70" y="76" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="28" fontWeight="600" fill={color}>
        {score}
      </text>
    </svg>
  )
}

function Dashboard() {
  const [latestScore, setLatestScore] = useState(null)
  const [trend, setTrend] = useState([])
  const [deployments, setDeployments] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/latest-score').then((res) => res.json()),
      fetch('/api/dashboard/score-trend').then((res) => res.json()),
      fetch('/api/dashboard/deployments').then((res) => res.json()),
    ])
      .then(([scoreData, trendData, deployData]) => {
        setLatestScore(scoreData)
        setTrend(trendData.reverse())
        setDeployments(deployData)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="dashboard">
        <p className="error-banner">Dashboard data not reachable: {error}</p>
      </div>
    )
  }

  let findings = []
  const latestReport = trend.length > 0 ? trend[trend.length - 1] : null
  if (latestReport && latestReport.findingsJson) {
    try {
      findings = JSON.parse(latestReport.findingsJson)
    } catch {
      findings = []
    }
  }

  return (
    <div className="dashboard">

      {latestScore && (
        <div className="card score-widget">
          <RadialGauge score={latestScore.security_score ?? 0} />
          <div>
            <p className="card-title" style={{ marginBottom: '6px' }}>Scan Target</p>
            <p className="score-meta">
              branch: {latestScore.branch}<br />
              commit: {latestScore.commit_sha?.slice(0, 10) ?? '—'}<br />
              audited: {latestScore.generated_at ?? '—'}
            </p>
            <div className="severity-row">
              {['critical', 'high', 'medium', 'low'].map((level) => (
                <span className="severity-pill" key={level}>
                  <span
                    className="severity-dot"
                    style={{ background: SEVERITY_COLOR[level.toUpperCase()] }}
                  />
                  {level}: {latestScore[level] ?? 0}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {trend.length > 0 && (
        <div className="card">
          <p className="card-title">Score Trend — last {trend.length} scans</p>
          <div className="trend-chart-wrap">
            <svg width={Math.max(trend.length * 44, 200)} height="140" viewBox={`0 0 ${Math.max(trend.length * 44, 200)} 140`}>
              {trend.map((report, i) => {
                const barHeight = (report.securityScore / 100) * 100
                return (
                  <g key={report.id}>
                    <rect
                      x={i * 44 + 8}
                      y={120 - barHeight}
                      width="20"
                      height={barHeight}
                      rx="3"
                      fill={scoreColor(report.securityScore)}
                    />
                    <text
                      x={i * 44 + 18}
                      y="134"
                      fontFamily="IBM Plex Mono, monospace"
                      fontSize="10"
                      textAnchor="middle"
                      fill="#8B93A7"
                    >
                      {report.securityScore}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      )}

      <div className="card">
        <p className="card-title">Latest Findings — {findings.length}</p>
        {findings.length === 0 ? (
          <p className="empty-state">No findings in the latest scan.</p>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Severity</th>
                <th>Package / Location</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f, i) => (
                <tr key={i}>
                  <td>{f.source}</td>
                  <td style={{ color: SEVERITY_COLOR[f.severity] ?? '#E6E9F0' }}>{f.severity}</td>
                  <td>{f.package}</td>
                  <td>{f.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <p className="card-title">Deployment History — last {deployments.length}</p>
        {deployments.length === 0 ? (
          <p className="empty-state">No deployments recorded yet.</p>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Commit</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Deployed At</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((d) => (
                <tr key={d.id}>
                  <td>{d.actor}</td>
                  <td>{d.commitSha?.slice(0, 10)}</td>
                  <td>{d.branch}</td>
                  <td style={{ color: d.status === 'SUCCESS' ? '#2DD4BF' : '#EF4444' }}>
                    {d.status}
                  </td>
                  <td>{d.deployedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Dashboard
