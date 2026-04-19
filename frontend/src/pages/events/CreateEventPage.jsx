import { useState } from 'react'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
import { UploadIcon } from '../../components/ui/Icons.jsx'

const initialForm = {
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  province: '',
  category: '',
  imagePreview: '',
  imageName: '',
}

const countWords = (value) => {
  const trimmed = value.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function CreateEventPage({ categories, locations, onCreateEvent }) {
  const [formValues, setFormValues] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const titleWordCount = countWords(formValues.title)
  const descriptionLength = formValues.description.trim().length

  const validateField = (field, value, currentValues) => {
    if (field === 'title') {
      if (!value.trim()) {
        return 'Event Title is required.'
      }

      if (countWords(value) < 5) {
        return 'Event Title must have at least 5 words.'
      }

      if (countWords(value) > 15) {
        return 'Event Title can have at most 15 words.'
      }
    }

    if (field === 'description') {
      const trimmedValue = value.trim()

      if (!trimmedValue) {
        return 'Description is required.'
      }

      if (trimmedValue.length < 150) {
        return 'Description must be at least 150 characters.'
      }

      if (trimmedValue.length > 500) {
        return 'Description can be at most 500 characters.'
      }
    }

    if (field === 'date' && !value) {
      return 'Date is required.'
    }

    if (field === 'time' && !value) {
      return 'Time is required.'
    }

    if (field === 'province' && !value) {
      return 'Province is required.'
    }

    if (field === 'category' && !value) {
      return 'Category is required.'
    }

    if (field === 'image' && currentValues.imageError) {
      return currentValues.imageError
    }

    return ''
  }

  const validateForm = (values) => ({
    title: validateField('title', values.title, values),
    description: validateField('description', values.description, values),
    date: validateField('date', values.date, values),
    time: validateField('time', values.time, values),
    province: validateField('province', values.province, values),
    category: validateField('category', values.category, values),
  })

  const isFormValid = !Object.values(validateForm(formValues)).some(Boolean)

  const updateField = (field, value) => {
    setFormValues((currentValues) => {
      const nextValues = {
        ...currentValues,
        [field]: value,
      }

      if (hasSubmitted) {
        setErrors(validateForm(nextValues))
      }

      return nextValues
    })
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      updateField('imagePreview', '')
      updateField('imageName', '')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setFormValues((currentValues) => {
        const nextValues = {
          ...currentValues,
          imagePreview: String(reader.result),
          imageName: file.name,
        }

        if (hasSubmitted) {
          setErrors(validateForm(nextValues))
        }

        return nextValues
      })
    }

    reader.readAsDataURL(file)
  }

  const handleReset = () => {
    setFormValues(initialForm)
    setErrors({})
    setHasSubmitted(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateForm(formValues)

    setHasSubmitted(true)
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    onCreateEvent(formValues)
    handleReset()
  }

  return (
    <div className="form-page">
      <section className="form-panel">
        <div className="form-page__heading">
          <h1>Create Event</h1>
          <p>Share your event with the community.</p>
        </div>

        <form className="event-form" onSubmit={handleSubmit}>
          <label className="upload-dropzone">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {formValues.imagePreview ? (
              <div className="upload-dropzone__preview">
                <img src={formValues.imagePreview} alt="Selected event preview" />
              </div>
            ) : null}
            <UploadIcon />
            <strong>Event Image</strong>
            <span>
              {formValues.imageName
                ? formValues.imageName
                : 'Click to upload or drag and drop'}
            </span>
            <small>PNG, JPG up to 10MB</small>
          </label>

          <label>
            <span>
              Event Title <em>*</em>
            </span>
            <input
              required
              value={formValues.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Summer Music Festival 2026"
              aria-invalid={Boolean(errors.title)}
            />
            <small className="field-hint">
              {titleWordCount}/15 words. Minimum 5 words required.
            </small>
            {errors.title ? <small className="field-error">{errors.title}</small> : null}
          </label>

          <label>
            <span>
              Description <em>*</em>
            </span>
            <textarea
              required
              rows="6"
              value={formValues.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Tell attendees what makes your event special..."
              maxLength="500"
              aria-invalid={Boolean(errors.description)}
            />
            <small className="field-hint">
              {descriptionLength}/500 characters. Minimum 150 characters required.
            </small>
            {errors.description ? (
              <small className="field-error">{errors.description}</small>
            ) : null}
          </label>

          <div className="event-form__row">
            <label>
              <span>
                Date <em>*</em>
              </span>
              <input
                required
                type="date"
                value={formValues.date}
                onChange={(event) => updateField('date', event.target.value)}
                aria-invalid={Boolean(errors.date)}
              />
              {errors.date ? <small className="field-error">{errors.date}</small> : null}
            </label>

            <label>
              <span>
                Time <em>*</em>
              </span>
              <input
                required
                type="time"
                value={formValues.time}
                onChange={(event) => updateField('time', event.target.value)}
                aria-invalid={Boolean(errors.time)}
              />
              {errors.time ? <small className="field-error">{errors.time}</small> : null}
            </label>
          </div>

          <label>
            <span>Venue / Address</span>
            <input
              value={formValues.venue}
              onChange={(event) => updateField('venue', event.target.value)}
              placeholder="Mall of Asia Arena or exact address"
            />
            <small className="field-hint">
              Optional for now. Province remains the required fallback.
            </small>
          </label>

          <div className="event-form__row">
            <label>
              <span>
                Province <em>*</em>
              </span>
              <select
                required
                value={formValues.province}
                onChange={(event) => updateField('province', event.target.value)}
                aria-invalid={Boolean(errors.province)}
              >
                <option value="">Select a province</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {errors.province ? (
                <small className="field-error">{errors.province}</small>
              ) : null}
            </label>

            <label>
              <span>
                Category <em>*</em>
              </span>
              <select
                required
                value={formValues.category}
                onChange={(event) => updateField('category', event.target.value)}
                aria-invalid={Boolean(errors.category)}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <small className="field-error">{errors.category}</small>
              ) : null}
            </label>
          </div>

          <div className="form-actions">
            <PrimaryButton
              type="submit"
              className="form-actions__primary"
              disabled={!isFormValid}
            >
              Create Event
            </PrimaryButton>
            <SecondaryButton
              type="button"
              className="form-actions__secondary"
              onClick={handleReset}
            >
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CreateEventPage
