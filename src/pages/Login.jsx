import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../store/authSlice.js'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({ email: '', password: '' })

  if (user) {
    return <Navigate to="/" replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await dispatch(loginUser(formData))

    if (loginUser.fulfilled.match(result)) {
      navigate('/')
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <label className="form-field">
          <span>Email</span>
          <input
            name="email"
            onChange={handleChange}
            required
            type="email"
            value={formData.email}
          />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input
            name="password"
            onChange={handleChange}
            required
            type="password"
            value={formData.password}
          />
        </label>
        {error ? <p className="status-message warning">{error}</p> : null}
        <button className="action-button primary" disabled={loading} type="submit">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="auth-switch">
          Need a profile? <Link to="/register">Register</Link>
        </p>
      </form>
    </section>
  )
}

export default Login
