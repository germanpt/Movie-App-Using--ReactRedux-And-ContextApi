import { NavLink, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice.js'

function Layout() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const favoriteCount = user?.favoriteIds?.length || 0

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar-inner">
          <NavLink className="brand" to="/">
            Movie Hub
          </NavLink>

          <nav className="nav-links">
            <NavLink
              end
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              to="/"
            >
              Home
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              to="/cart"
            >
              Favorites ({favoriteCount})
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              to="/about"
            >
              About
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              to="/contact"
            >
              Contact
            </NavLink>
            {user ? (
              <>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                  to="/profile"
                >
                  Profile
                </NavLink>
                <button className="nav-button" onClick={() => dispatch(logout())} type="button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                  to="/login"
                >
                  Login
                </NavLink>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                  to="/register"
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
