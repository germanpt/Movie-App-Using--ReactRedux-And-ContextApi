import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import MovieCard from '../components/MovieCard.jsx'
import { updateProfile } from '../store/authSlice.js'
import { fetchMovies } from '../store/moviesSlice.js'

function Profile() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)
  const movies = useSelector((state) => state.movies.items)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    picture: user?.picture || '',
  })

  useEffect(() => {
    if (movies.length === 0) {
      dispatch(fetchMovies())
    }
  }, [dispatch, movies.length])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const favoriteMovies = movies.filter((movie) => user.favoriteIds?.includes(movie.id))
  const addedMovies = movies.filter((movie) => movie.addedBy === user.id)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    dispatch(updateProfile({ userId: user.id, profile: formData }))
  }

  return (
    <section className="page">
      <div className="profile-grid">
        <div className="page-card profile-card">
          <img
            className="profile-avatar"
            src={
              user.picture ||
              'https://via.placeholder.com/180x180?text=Profile'
            }
            alt={user.name}
          />
          <h1 className="page-title">{user.name}</h1>
          <p className="page-text">{user.email}</p>
          <p className="profile-bio">
            {user.bio || 'No bio yet. Add one using the form.'}
          </p>
          <div className="stats-row">
            <div className="stat-card">
              <strong>{favoriteMovies.length}</strong>
              <span>Favorites</span>
            </div>
            <div className="stat-card">
              <strong>{addedMovies.length}</strong>
              <span>Added</span>
            </div>
          </div>
        </div>

        <form className="page-card profile-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h2>Edit Profile</h2>
            <p>Update your name, bio, and profile picture URL.</p>
          </div>

          <label className="form-field">
            <span>Name</span>
            <input
              name="name"
              onChange={handleChange}
              required
              type="text"
              value={formData.name}
            />
          </label>

          <label className="form-field">
            <span>Picture URL</span>
            <input
              name="picture"
              onChange={handleChange}
              placeholder="https://example.com/profile.jpg"
              type="url"
              value={formData.picture}
            />
          </label>

          <label className="form-field">
            <span>Bio</span>
            <textarea
              name="bio"
              onChange={handleChange}
              placeholder="Write a short bio"
              rows="5"
              value={formData.bio}
            />
          </label>

          {error ? <p className="status-message warning">{error}</p> : null}

          <button className="action-button primary" disabled={loading} type="submit">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="section-header">
        <h2 className="section-title">Favorite Movies</h2>
        <p className="page-text">Movies you marked as favorites.</p>
      </div>

      {favoriteMovies.length === 0 ? (
        <div className="page-card empty-state">
          <p>No favorite movies yet.</p>
          <Link className="not-found-link" to="/">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="movies-grid profile-movies">
          {favoriteMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      <div className="section-header profile-section">
        <h2 className="section-title">Movies You Added</h2>
        <p className="page-text">Movies created from your logged-in profile.</p>
      </div>

      {addedMovies.length === 0 ? (
        <div className="page-card empty-state">
          <p>You have not added any movies yet.</p>
          <Link className="not-found-link" to="/">
            Add a Movie
          </Link>
        </div>
      ) : (
        <div className="movies-grid profile-movies">
          {addedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Profile
