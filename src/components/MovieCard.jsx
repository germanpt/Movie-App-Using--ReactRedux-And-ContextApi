function MovieCard({ movie, children }) {
  return (
    <article className="movie-card">
      <img className="movie-poster" src={movie.image} alt={movie.title} />

      <div className="movie-card-header">
        <h3 className="movie-title">{movie.title}</h3>
        <span className="movie-rating">{movie.rating}</span>
      </div>

      <div className="movie-meta">
        <span>Director: {movie.director}</span>
        <span>{movie.year}</span>
      </div>

      <p className="movie-description">{movie.description}</p>
      {children ? <div className="movie-actions">{children}</div> : null}
    </article>
  )
}

export default MovieCard
