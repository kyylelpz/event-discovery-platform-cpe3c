import { useState } from 'react'
import { PrimaryButton, SecondaryButton } from '../../components/ui/Button.jsx'
import { UploadIcon } from '../../components/ui/Icons.jsx'

const initialForm = {
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  location: 'Metro Manila',
  category: 'Music',
}

function CreateEventPage({ categories, locations, onCreateEvent }) {
  const [formValues, setFormValues] = useState(initialForm)

  const updateField = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onCreateEvent(formValues)
    setFormValues(initialForm)
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
            <input type="file" accept="image/*" />
            <UploadIcon />
            <strong>Event Image</strong>
            <span>Click to upload or drag and drop</span>
            <small>PNG, JPG up to 10MB</small>
          </label>

          <label>
            <span>Event Title</span>
            <input
              required
              value={formValues.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Summer Music Festival 2026"
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              required
              rows="6"
              value={formValues.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Tell attendees what makes your event special..."
            />
          </label>

          <div className="event-form__row">
            <label>
              <span>Date</span>
              <input
                required
                type="date"
                value={formValues.date}
                onChange={(event) => updateField('date', event.target.value)}
              />
            </label>

            <label>
              <span>Time</span>
              <input
                required
                type="text"
                value={formValues.time}
                onChange={(event) => updateField('time', event.target.value)}
                placeholder="6:00 PM"
              />
            </label>
          </div>

          <label>
            <span>Location</span>
            <input
              required
              value={formValues.venue}
              onChange={(event) => updateField('venue', event.target.value)}
              placeholder="Mall of Asia Arena"
            />
          </label>

          <div className="event-form__row">
            <label>
              <span>Luzon Province</span>
              <select
                value={formValues.location}
                onChange={(event) => updateField('location', event.target.value)}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Category</span>
              <select
                value={formValues.category}
                onChange={(event) => updateField('category', event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <PrimaryButton type="submit" className="form-actions__primary">
              Create Event
            </PrimaryButton>
            <SecondaryButton type="button" className="form-actions__secondary">
              Cancel
            </SecondaryButton>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CreateEventPage
