import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import moviesReducer from './moviesSlice.js'

const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: moviesReducer,
  },
})

export default store
