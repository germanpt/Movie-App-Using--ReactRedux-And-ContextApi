import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import MovieCard from '../components/MovieCard.jsx'
import MovieForm from '../components/MovieForm.jsx'
import { addMovie, deleteMovie, fetchMovies, updateMovie } from '../store/moviesSlice.js'
import { saveFavorites } from '../store/authSlice.js'

function Home() {
  const dispatch = useDispatch()
  const { items: movies, loading, error } = useSelector((state) => state.movies)
  const user = useSelector((state) => state.auth.user)
  const [editingMovieId, setEditingMovieId] = useState('')

  useEffect(() => {
    dispatch(fetchMovies())
  }, [dispatch])

  function toggleFavorite(movieId) {
    if (!user) {
      return
    }

    const currentFavorites = user.favoriteIds || []
    const favoriteIds = currentFavorites.includes(movieId)
      ? currentFavorites.filter((id) => id !== movieId)
      : [...currentFavorites, movieId]

    dispatch(saveFavorites({ userId: user.id, favoriteIds }))
  }

  return (
    <section className="page">
      <div className="hero-section">
        <div className="hero-card">
          <span className="hero-badge">ITI React Redux Lab</span>
          <h1 className="hero-title">Movie Hub</h1>
          <p className="hero-text">
            Browse movies fetched from the API. Create a profile to favorite,
            edit, and delete movies.
          </p>
          {!user ? (
            <div className="movie-actions">
              <Link className="action-button primary link-button" to="/register">
                Create Profile
              </Link>
              <Link className="action-button secondary link-button" to="/login">
                Login
              </Link>
            </div>
          ) : (
            <p className="profile-pill">Welcome, {user.name}</p>
          )}
        </div>

        <div className="info-card">
          <h2>{movies.length}</h2>
          <p>Movies loaded from the API and managed with React Redux.</p>
        </div>
      </div>

      {user ? (
        <div className="page-card add-movie-panel">
          <MovieForm
            key="add-movie"
            onSubmit={(movie) => dispatch(addMovie({ ...movie, addedBy: user.id }))}
            submitLabel="Add Movie"
            title="Add Movie"
          />
        </div>
      ) : null}

      <div className="section-header">
        <h2 className="section-title">All Movies</h2>
        <p className="page-text">
          {user
            ? 'You can favorite, edit, or delete any movie from this landing page.'
            : 'Login or register before changing movies or saving favorites.'}
        </p>
      </div>

      {loading ? <p className="status-message">Loading movies...</p> : null}
      {error ? <p className="status-message warning">{error}</p> : null}

      {!loading ? (
        <div className="movies-grid">
          {movies.map((movie) => {
            const isFavorite = user?.favoriteIds?.includes(movie.id)

            return editingMovieId === movie.id ? (
              <article className="movie-card" key={movie.id}>
                <MovieForm
                  initialValues={movie}
                  key={movie.id}
                  onCancel={() => setEditingMovieId('')}
                  onSubmit={(updatedMovie) => {
                    dispatch(updateMovie({ id: movie.id, movie: updatedMovie }))
                    setEditingMovieId('')
                  }}
                  submitLabel="Save Changes"
                  title={`Edit ${movie.title}`}
                />
              </article>
            ) : (
              <MovieCard key={movie.id} movie={movie}>
                {user ? (
                  <>
                    <button
                      className={isFavorite ? 'action-button primary' : 'action-button secondary'}
                      onClick={() => toggleFavorite(movie.id)}
                      type="button"
                    >
                      {isFavorite ? 'Favorited' : 'Favorite'}
                    </button>
                    <button
                      className="action-button secondary"
                      onClick={() => setEditingMovieId(movie.id)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="action-button danger"
                      onClick={() => dispatch(deleteMovie(movie.id))}
                      type="button"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <Link className="action-button primary link-button" to="/login">
                    Login to Manage
                  </Link>
                )}
              </MovieCard>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

export default Home
