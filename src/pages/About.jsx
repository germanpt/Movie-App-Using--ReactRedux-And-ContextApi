function About() {
  return (
    <section className="page">
      <div className="page-card">
        <h1 className="page-title">About</h1>
        <p className="page-text">
          This project uses React Router for page navigation and React Redux for
          shared movie and profile state.
        </p>
        <p className="page-text">
          Movies are loaded from the API through the Vite server, stored in a
          local <code>db.json</code> file, and reused across the landing page and
          favorites page so CRUD operations stay in sync.
        </p>
      </div>
    </section>
  )
}

export default About
