import fs from 'node:fs/promises'
import path from 'node:path'

const dbPath = path.resolve('db.json')

const emptyDb = {
  movies: [],
  cart: [],
  users: [],
}

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

function createMovieId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function ensureDbFile() {
  try {
    await fs.access(dbPath)
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(emptyDb, null, 2))
  }
}

async function readDb() {
  await ensureDbFile()

  const content = await fs.readFile(dbPath, 'utf8')
  const parsed = JSON.parse(content)

  return {
    movies: Array.isArray(parsed.movies) ? parsed.movies : [],
    cart: Array.isArray(parsed.cart) ? parsed.cart : [],
    users: Array.isArray(parsed.users) ? parsed.users : [],
  }
}

async function writeDb(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2))
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(error)
      }
    })

    request.on('error', reject)
  })
}

function createUserId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio || '',
    picture: user.picture || '',
    favoriteIds: Array.isArray(user.favoriteIds) ? user.favoriteIds : [],
  }
}

function normalizeUser(user) {
  return {
    id: user.id || createUserId(),
    name: String(user.name || '').trim(),
    email: normalizeEmail(user.email),
    password: String(user.password || ''),
    bio: String(user.bio || '').trim(),
    picture: String(user.picture || '').trim(),
    favoriteIds: Array.isArray(user.favoriteIds) ? user.favoriteIds : [],
  }
}

async function seedMoviesFromApi() {
  const db = await readDb()

  if (db.movies.length > 0) {
    return db
  }

  const response = await fetch('https://ghibliapi.vercel.app/films')

  if (!response.ok) {
    throw new Error('Failed to fetch movies from the API.')
  }

  const data = await response.json()
  const movies = data.map((movie) =>
    normalizeMovie({
      id: movie.id,
      title: movie.title,
      rating: `${movie.rt_score}%`,
      director: movie.director,
      year: movie.release_date,
      image: movie.image,
      description: movie.description,
    }),
  )

  const nextDb = {
    ...db,
    movies,
  }

  await writeDb(nextDb)
  return nextDb
}

async function handleApiRequest(request, response) {
  const url = new URL(request.url, 'http://localhost')

  if (request.method === 'GET' && url.pathname === '/api/init') {
    const db = await seedMoviesFromApi()
    sendJson(response, 200, {
      movies: db.movies,
      users: db.users.map(toPublicUser),
    })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/movies') {
    const db = await readDb()
    sendJson(response, 200, db.movies)
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/register') {
    const db = await readDb()
    const body = await parseBody(request)
    const user = normalizeUser(body)

    if (!user.name || !user.email || !user.password) {
      sendJson(response, 400, { message: 'Name, email, and password are required.' })
      return
    }

    if (db.users.some((currentUser) => normalizeEmail(currentUser.email) === user.email)) {
      sendJson(response, 409, { message: 'This email already has a profile.' })
      return
    }

    const nextDb = {
      ...db,
      users: [user, ...db.users],
    }

    await writeDb(nextDb)
    sendJson(response, 201, toPublicUser(user))
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/login') {
    const db = await readDb()
    const body = await parseBody(request)
    const email = normalizeEmail(body.email)
    const password = String(body.password || '')
    const user = db.users.find(
      (currentUser) =>
        normalizeEmail(currentUser.email) === email && currentUser.password === password,
    )

    if (!user) {
      sendJson(response, 401, { message: 'Invalid email or password.' })
      return
    }

    sendJson(response, 200, toPublicUser(user))
    return
  }

  const profileUserId = url.pathname.split('/api/users/')[1]?.split('/profile')[0]

  if (
    profileUserId &&
    url.pathname.endsWith('/profile') &&
    request.method === 'PUT'
  ) {
    const db = await readDb()
    const body = await parseBody(request)
    const index = db.users.findIndex((user) => user.id === profileUserId)

    if (index === -1) {
      sendJson(response, 404, { message: 'Profile not found.' })
      return
    }

    const nextUsers = [...db.users]
    nextUsers[index] = normalizeUser({
      ...nextUsers[index],
      name: body.name ?? nextUsers[index].name,
      bio: body.bio ?? nextUsers[index].bio,
      picture: body.picture ?? nextUsers[index].picture,
    })

    await writeDb({
      ...db,
      users: nextUsers,
    })

    sendJson(response, 200, toPublicUser(nextUsers[index]))
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/movies') {
    const db = await readDb()
    const body = await parseBody(request)
    const movie = normalizeMovie({
      ...body,
      id: body.id || createMovieId(),
    })

    const nextDb = {
      ...db,
      movies: [movie, ...db.movies],
    }

    await writeDb(nextDb)
    sendJson(response, 201, movie)
    return
  }

  const editableMovieId = url.pathname.split('/api/movies/')[1]

  if (editableMovieId && request.method === 'PUT') {
    const db = await readDb()
    const body = await parseBody(request)
    const index = db.movies.findIndex((movie) => movie.id === editableMovieId)

    if (index === -1) {
      sendJson(response, 404, { message: 'Movie not found.' })
      return
    }

    const updatedMovie = normalizeMovie({
      ...db.movies[index],
      ...body,
      id: editableMovieId,
    })

    const nextMovies = [...db.movies]
    nextMovies[index] = updatedMovie

    await writeDb({
      ...db,
      movies: nextMovies,
    })

    sendJson(response, 200, updatedMovie)
    return
  }

  if (editableMovieId && request.method === 'DELETE') {
    const db = await readDb()
    const nextMovies = db.movies.filter((movie) => movie.id !== editableMovieId)
    const nextUsers = db.users.map((user) => ({
      ...user,
      favoriteIds: (user.favoriteIds || []).filter((id) => id !== editableMovieId),
    }))

    await writeDb({
      ...db,
      movies: nextMovies,
      users: nextUsers,
    })

    sendJson(response, 200, { id: editableMovieId })
    return
  }

  const favoriteUserId = url.pathname.split('/api/users/')[1]?.split('/favorites')[0]

  if (
    favoriteUserId &&
    url.pathname.endsWith('/favorites') &&
    request.method === 'PUT'
  ) {
    const db = await readDb()
    const body = await parseBody(request)
    const index = db.users.findIndex((user) => user.id === favoriteUserId)

    if (index === -1) {
      sendJson(response, 404, { message: 'Profile not found.' })
      return
    }

    const movieIds = new Set(db.movies.map((movie) => movie.id))
    const favoriteIds = Array.isArray(body.favoriteIds)
      ? body.favoriteIds.filter((id) => movieIds.has(id))
      : []
    const nextUsers = [...db.users]
    nextUsers[index] = {
      ...nextUsers[index],
      favoriteIds,
    }

    await writeDb({
      ...db,
      users: nextUsers,
    })

    sendJson(response, 200, toPublicUser(nextUsers[index]))
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/cart') {
    const db = await readDb()
    sendJson(response, 200, db.cart)
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/cart') {
    const db = await readDb()
    const body = await parseBody(request)
    const movie = normalizeMovie({
      ...body,
      id: body.id || createMovieId(),
    })

    if (db.cart.some((item) => item.id === movie.id)) {
      sendJson(response, 200, movie)
      return
    }

    const nextDb = {
      ...db,
      cart: [movie, ...db.cart],
    }

    await writeDb(nextDb)
    sendJson(response, 201, movie)
    return
  }

  const movieId = url.pathname.split('/api/cart/')[1]

  if (movieId && request.method === 'PUT') {
    const db = await readDb()
    const body = await parseBody(request)
    const index = db.cart.findIndex((movie) => movie.id === movieId)

    if (index === -1) {
      sendJson(response, 404, { message: 'Movie not found.' })
      return
    }

    const updatedMovie = normalizeMovie({
      ...body,
      id: movieId,
    })

    const nextCart = [...db.cart]
    nextCart[index] = updatedMovie

    await writeDb({
      ...db,
      cart: nextCart,
    })

    sendJson(response, 200, updatedMovie)
    return
  }

  if (movieId && request.method === 'DELETE') {
    const db = await readDb()
    const nextCart = db.cart.filter((movie) => movie.id !== movieId)

    await writeDb({
      ...db,
      cart: nextCart,
    })

    sendJson(response, 200, { id: movieId })
    return
  }

  sendJson(response, 404, { message: 'API route not found.' })
}

export default function jsonDbPlugin() {
  const middleware = async (request, response, next) => {
    if (!request.url?.startsWith('/api')) {
      next()
      return
    }

    try {
      await handleApiRequest(request, response)
    } catch (error) {
      sendJson(response, 500, {
        message: error instanceof Error ? error.message : 'Unexpected server error.',
      })
    }
  }

  return {
    name: 'json-db-plugin',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
