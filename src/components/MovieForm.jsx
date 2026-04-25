import { useState } from 'react'

const emptyMovie = {
  title: '',
  director: '',
  year: '',
  rating: '',
  image: '',
  description: '',
}

function MovieForm({
  initialValues = emptyMovie,
  submitLabel,
  title,
  onSubmit,
  onCancel,
}) {
  const [formValues, setFormValues] = useState(() => ({ ...initialValues }))

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(formValues)

    if (!onCancel) {
      setFormValues(emptyMovie)
    }
  }

  return (
    <form className="movie-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>{title}</h2>
        <p>Fill in the movie details, then save it to the API-backed movie list.</p>
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span>Title</span>
          <input
            name="title"
            onChange={handleChange}
            placeholder="Movie title"
            required
            type="text"
            value={formValues.title}
          />
        </label>

        <label className="form-field">
          <span>Director</span>
          <input
            name="director"
            onChange={handleChange}
            placeholder="Director name"
            required
            type="text"
            value={formValues.director}
          />
        </label>

        <label className="form-field">
          <span>Release Year</span>
          <input
            name="year"
            onChange={handleChange}
            placeholder="2001"
            required
            type="text"
            value={formValues.year}
          />
        </label>

        <label className="form-field">
          <span>Rating</span>
          <input
            name="rating"
            onChange={handleChange}
            placeholder="95%"
            required
            type="text"
            value={formValues.rating}
          />
        </label>

        <label className="form-field form-field-full">
          <span>Poster URL</span>
          <input
            name="image"
            onChange={handleChange}
            placeholder="https://example.com/poster.jpg"
            type="url"
            value={formValues.image}
          />
        </label>

        <label className="form-field form-field-full">
          <span>Description</span>
          <textarea
            name="description"
            onChange={handleChange}
            placeholder="Short movie summary"
            required
            rows="4"
            value={formValues.description}
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="action-button primary" type="submit">
          {submitLabel}
        </button>
        {onCancel ? (
          <button className="action-button ghost" onClick={onCancel} type="button">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}

export default MovieForm
