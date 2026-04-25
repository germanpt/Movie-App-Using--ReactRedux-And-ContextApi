import { createContext, useEffect, useState } from 'react'
import api from '../lib/api.js'

const MoviesContext = createContext(null)

function normalizeMovie(movie) {
  return {
    id: movie.id,
    title: movie.title?.trim() || 'Untitled Movie',
    rating: movie.rating?.trim() || 'N/A',
    director: movie.director?.trim() || 'Unknown Director',
    year: movie.year?.trim() || 'Unknown Year',
    image:
      movie.image?.trim() ||
      'https://via.placeholder.com/400x600?text=Movie+Poster',
    description:
      movie.description?.trim() || 'No description is available for this movie.',
  }
}

function createLocalMovieId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function MoviesProvider({ children }) {
  const [movies, setMovies] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadMovies() {
      setLoading(true)

      try {
        const response = await api.get('/init')

        if (!ignore) {
          setMovies(response.data.movies)
          setCart(response.data.cart)
          setError('')
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError.response?.data?.message ||
              'The JSON file could not be loaded. Start the Vite server and try again.',
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadMovies()

    return () => {
      ignore = true
    }
  }, [])

  async function addToCart(movie) {
    if (cart.some((cartMovie) => cartMovie.id === movie.id)) {
      return
    }

    try {
      const response = await api.post('/cart', normalizeMovie(movie))

      setCart((currentCart) => {
        if (currentCart.some((cartMovie) => cartMovie.id === response.data.id)) {
          return currentCart
        }

        return [response.data, ...currentCart]
      })
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not add the movie to db.json.')
    }
  }

  async function addCustomMovie(movie) {
    try {
      const newMovie = normalizeMovie({
        ...movie,
        id: createLocalMovieId(),
      })

      const response = await api.post('/cart', newMovie)
      setCart((currentCart) => [response.data, ...currentCart])
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save the new movie to db.json.')
    }
  }

  async function updateCartMovie(id, updatedMovie) {
    try {
      const currentMovie = cart.find((movie) => movie.id === id)

      if (!currentMovie) {
        return
      }

      const response = await api.put(
        `/cart/${encodeURIComponent(id)}`,
        normalizeMovie({
          ...currentMovie,
          ...updatedMovie,
          id,
        }),
      )

      setCart((currentCart) =>
        currentCart.map((movie) => (movie.id === id ? response.data : movie)),
      )
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update the movie in db.json.')
    }
  }

  async function deleteCartMovie(id) {
    try {
      await api.delete(`/cart/${encodeURIComponent(id)}`)
      setCart((currentCart) => currentCart.filter((movie) => movie.id !== id))
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete the movie from db.json.')
    }
  }

  function isMovieInCart(id) {
    return cart.some((movie) => movie.id === id)
  }

  const value = {
    movies,
    cart,
    loading,
    error,
    addToCart,
    addCustomMovie,
    updateCartMovie,
    deleteCartMovie,
    isMovieInCart,
  }

  return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>
}

export default MoviesContext
