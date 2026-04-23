import { useEffect, useMemo, useState } from 'react'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
import { UploadIcon } from '../../components/ui/Icons.jsx'

const emptyForm = {
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  address: '',
  googleMapsUrl: '',
  province: '',
  category: '',
  imageFile: null,
  imagePreview: '',
  imageName: '',
}

const buildFormValues = (initialValues = {}) => {
  const safeInitialValues =
    initialValues && typeof initialValues === 'object' ? initialValues : {}

  return {
    ...emptyForm,
    ...safeInitialValues,
    title: String(safeInitialValues.title || '').trim(),
    description: String(safeInitialValues.description || ''),
    date: String(safeInitialValues.date || safeInitialValues.startDate || '').trim(),
    time: String(safeInitialValues.time || safeInitialValues.timeLabel || '').trim(),
    venue: String(safeInitialValues.venue || '').trim(),
    address: String(safeInitialValues.address || '').trim(),
    googleMapsUrl: String(
      safeInitialValues.googleMapsUrl || safeInitialValues.venueGoogleMapsUrl || '',
    ).trim(),
    province: String(safeInitialValues.province || '').trim(),
    category: String(safeInitialValues.category || '').trim(),
    imageFile: null,
    imagePreview: String(
      safeInitialValues.imagePreview || safeInitialValues.image || '',
    ).trim(),
    imageName: '',
  }
}

const countWords = (value) => {
  const trimmed = value.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

const getCurrentDateTimeParts = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  const hours = `${now.getHours()}`.padStart(2, '0')
  const minutes = `${now.getMinutes()}`.padStart(2, '0')

  return {
    minDate: `${year}-${month}-${day}`,
    currentTime: `${hours}:${minutes}`,
  }
}

function CreateEventPage({
  categories,
  locations,
  onSubmitEvent,
  initialValues = {},
  pageTitle = 'Create Event',
  pageCopy = 'Share your event with the community.',
  submitLabel = 'Create Event',
  submittingLabel = 'Creating Event...',
  submissionErrorMessage = 'Unable to create your event right now.',
  onCancel,
}) {
  const initialForm = useMemo(() => buildFormValues(initialValues), [initialValues])
  const [formValues, setFormValues] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const titleWordCount = countWords(formValues.title)
  const descriptionLength = formValues.description.trim().length
  const { minDate, currentTime } = getCurrentDateTimeParts()

  useEffect(() => {
    setFormValues(initialForm)
    setErrors({})
    setHasSubmitted(false)
    setSubmissionError('')
    setIsSubmitting(false)
  }, [initialForm])

  const validateField = (field, value, currentValues) => {
    if (field === 'title') {
      if (!value.trim()) {
        return 'Event Title is required.'
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

      if (trimmedValue.length > 500) {
        return 'Description can be at most 500 characters.'
      }
    }

    if (field === 'venue' && !value.trim()) {
      return 'Venue is required.'
    }

    if (field === 'date' && !value) {
      return 'Date is required.'
    }

    if (field === 'time' && !value) {
      return 'Time is required.'
    }

    if (
      (field === 'date' || field === 'time') &&
      currentValues.date &&
      currentValues.time
    ) {
      if (currentValues.date < minDate) {
        return 'You cannot create an event on a past date.'
      }

      if (currentValues.date === minDate && currentValues.time < currentTime) {
        return 'You cannot create an event for a past time today.'
      }
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
    venue: validateField('venue', values.venue, values),
    date: validateField('date', values.date, values),
    time: validateField('time', values.time, values),
    province: validateField('province', values.province, values),
    category: validateField('category', values.category, values),
  })

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
      updateField('imageFile', null)
      updateField('imagePreview', '')
      updateField('imageName', '')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setFormValues((currentValues) => {
        const nextValues = {
          ...currentValues,
          imageFile: file,
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
    setSubmissionError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateForm(formValues)

    setHasSubmitted(true)
    setErrors(nextErrors)
    setSubmissionError('')

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmitEvent(formValues)
      handleReset()
    } catch (submitError) {
      setSubmissionError(submitError.message || submissionErrorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <section className="form-panel">
        <div className="form-page__heading">
          <h1>{pageTitle}</h1>
          <p>{pageCopy}</p>
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
                : formValues.imagePreview
                  ? 'Choose a new image to replace the current one'
                  : 'Click to upload or drag and drop'}
            </span>
            <small>PNG, JPG, WEBP, or GIF up to 8MB</small>
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
              {titleWordCount}/15 words.
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
              {descriptionLength}/500 characters.
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
                min={minDate}
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
                min={formValues.date === minDate ? currentTime : undefined}
                value={formValues.time}
                onChange={(event) => updateField('time', event.target.value)}
                aria-invalid={Boolean(errors.time)}
              />
              {errors.time ? <small className="field-error">{errors.time}</small> : null}
            </label>
          </div>

          <label>
            <span>
              Venue / Address <em>*</em>
            </span>
            <input
              required
              value={formValues.venue}
              onChange={(event) => updateField('venue', event.target.value)}
              placeholder="Mall of Asia Arena"
              aria-invalid={Boolean(errors.venue)}
            />
            <small className="field-hint">
              Use the venue or place name that people can search in Google Maps.
            </small>
            {errors.venue ? <small className="field-error">{errors.venue}</small> : null}
          </label>

          <label>
            <span>Street Address / Landmark</span>
            <input
              value={formValues.address}
              onChange={(event) => updateField('address', event.target.value)}
              placeholder="Seaside Blvd, Pasay, Metro Manila"
            />
            <small className="field-hint">
              Add a fuller address to make the map preview and directions more accurate.
            </small>
          </label>

          <label>
            <span>Google Maps Link</span>
            <input
              type="url"
              value={formValues.googleMapsUrl}
              onChange={(event) => updateField('googleMapsUrl', event.target.value)}
              placeholder="https://maps.google.com/..."
            />
            <small className="field-hint">
              Optional. If provided, attendees will open this exact Google Maps location.
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
              disabled={isSubmitting}
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </PrimaryButton>
            <SecondaryButton
              type="button"
              className="form-actions__secondary"
              onClick={onCancel || handleReset}
              disabled={isSubmitting}
            >
              Cancel
            </SecondaryButton>
          </div>

          {submissionError ? (
            <small className="field-error">{submissionError}</small>
          ) : null}
        </form>
      </section>
    </div>
  )
}

export default CreateEventPage
