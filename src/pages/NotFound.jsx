import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="page">
      <div className="page-card">
        <h1 className="page-title">Page Not Found</h1>
        <p className="page-text">
          The page you are looking for does not exist.
        </p>
        <Link className="not-found-link" to="/">
          Back to Home
        </Link>
      </div>
    </section>
  )
}

export default NotFound
