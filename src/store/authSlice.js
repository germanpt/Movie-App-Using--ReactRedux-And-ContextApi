import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../lib/api.js'

const savedUser = JSON.parse(localStorage.getItem('movieHubUser') || 'null')

function saveUser(user) {
  if (user) {
    localStorage.setItem('movieHubUser', JSON.stringify(user))
  } else {
    localStorage.removeItem('movieHubUser')
  }
}

export const registerUser = createAsyncThunk('auth/registerUser', async (formData, thunkApi) => {
  try {
    const response = await api.post('/register', formData)
    return response.data
  } catch (error) {
    return thunkApi.rejectWithValue(
      error.response?.data?.message || 'Could not create your profile.',
    )
  }
})

export const loginUser = createAsyncThunk('auth/loginUser', async (formData, thunkApi) => {
  try {
    const response = await api.post('/login', formData)
    return response.data
  } catch (error) {
    return thunkApi.rejectWithValue(
      error.response?.data?.message || 'Could not log in.',
    )
  }
})

export const saveFavorites = createAsyncThunk(
  'auth/saveFavorites',
  async ({ userId, favoriteIds }, thunkApi) => {
    try {
      const response = await api.put(`/users/${encodeURIComponent(userId)}/favorites`, {
        favoriteIds,
      })
      return response.data
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || 'Could not update favorites.',
      )
    }
  },
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ userId, profile }, thunkApi) => {
    try {
      const response = await api.put(`/users/${encodeURIComponent(userId)}/profile`, profile)
      return response.data
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || 'Could not update your profile.',
      )
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    loading: false,
    error: '',
  },
  reducers: {
    logout(state) {
      state.user = null
      state.error = ''
      saveUser(null)
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true
          state.error = ''
        },
      )
      .addMatcher(
        (action) =>
          [
            registerUser.fulfilled.type,
            loginUser.fulfilled.type,
            saveFavorites.fulfilled.type,
            updateProfile.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = false
          state.user = action.payload
          saveUser(action.payload)
        },
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false
          state.error = action.payload || 'Something went wrong.'
        },
      )
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
