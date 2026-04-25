import { useContext } from 'react'
import MoviesContext from '../context/MoviesContext.jsx'

function useMovies() {
  const context = useContext(MoviesContext)

  if (!context) {
    throw new Error('useMovies must be used inside MoviesProvider')
  }

  return context
}

export default useMovies
