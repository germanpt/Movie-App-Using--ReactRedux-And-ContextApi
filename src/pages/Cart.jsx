import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MovieCard from '../components/MovieCard.jsx'
import { fetchMovies } from '../store/moviesSlice.js'

function Cart() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const movies = useSelector((state) => state.movies.items)
  const favoriteMovies = movies.filter((movie) => user?.favoriteIds?.includes(movie.id))

  useEffect(() => {
    if (movies.length === 0) {
      dispatch(fetchMovies())
    }
  }, [dispatch, movies.length])

  if (!user) {
    return (
      <section className="page">
        <div className="page-card empty-state">
          <h1 className="page-title">Favorites</h1>
          <p className="page-text">Create a profile or login before saving favorite movies.</p>
          <Link className="action-button primary link-button" to="/register">
            Create Profile
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="section-header">
        <h1 className="page-title">Favorite Movies</h1>
        <p className="page-text">
          {favoriteMovies.length} movie{favoriteMovies.length === 1 ? '' : 's'} saved by{' '}
          {user.name}.
        </p>
      </div>

      {favoriteMovies.length === 0 ? (
        <div className="page-card empty-state">
          <h3>No favorites yet</h3>
          <p>Go back to the landing page and favorite a movie.</p>
          <Link className="not-found-link" to="/">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="movies-grid">
          {favoriteMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Cart
