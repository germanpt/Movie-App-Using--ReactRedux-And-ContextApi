import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../lib/api.js'

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
    addedBy: movie.addedBy || '',
  }
}

export const fetchMovies = createAsyncThunk('movies/fetchMovies', async (_, thunkApi) => {
  try {
    const response = await api.get('/init')
    return response.data.movies
  } catch (error) {
    return thunkApi.rejectWithValue(
      error.response?.data?.message || 'Could not load movies from the API.',
    )
  }
})

export const addMovie = createAsyncThunk('movies/addMovie', async (movie, thunkApi) => {
  try {
    const response = await api.post('/movies', normalizeMovie(movie))
    return response.data
  } catch (error) {
    return thunkApi.rejectWithValue(
      error.response?.data?.message || 'Could not add the movie.',
    )
  }
})

export const updateMovie = createAsyncThunk(
  'movies/updateMovie',
  async ({ id, movie }, thunkApi) => {
    try {
      const response = await api.put(`/movies/${encodeURIComponent(id)}`, movie)
      return response.data
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || 'Could not update the movie.',
      )
    }
  },
)

export const deleteMovie = createAsyncThunk('movies/deleteMovie', async (id, thunkApi) => {
  try {
    await api.delete(`/movies/${encodeURIComponent(id)}`)
    return id
  } catch (error) {
    return thunkApi.rejectWithValue(
      error.response?.data?.message || 'Could not delete the movie.',
    )
  }
})

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    items: [],
    loading: false,
    error: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addMovie.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateMovie.fulfilled, (state, action) => {
        state.items = state.items.map((movie) =>
          movie.id === action.payload.id ? action.payload : movie,
        )
      })
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.items = state.items.filter((movie) => movie.id !== action.payload)
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('movies/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload || 'Something went wrong.'
        },
      )
  },
})

export default moviesSlice.reducer
