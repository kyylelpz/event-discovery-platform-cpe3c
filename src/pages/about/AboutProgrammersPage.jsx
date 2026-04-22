import { useEffect, useRef, useState } from 'react'
import imageAquino from '../../assets/photos/image-aquino.png'
import imageBautista from '../../assets/photos/image-bautista.png'
import imageBernal from '../../assets/photos/image-bernal.jpg'
import imageFrancisco from '../../assets/photos/image-francisco.png'
import imageLopez from '../../assets/photos/image-lopez.png'
import resumeAquino from '../../assets/resume/resume-aquino.pdf'
import resumeBautista from '../../assets/resume/resume-bautista.pdf'
import resumeBernal from '../../assets/resume/resume-bernal.pdf'
import resumeFrancisco from '../../assets/resume/resume-francisco.pdf'
import resumeLopez from '../../assets/resume/resume-lopez.pdf'
import { programmerProfiles } from '../../data/sitePages.js'

const AUTO_SCROLL_SPEED = 24
const AUTO_RESUME_DELAY = 5000
const SLIDER_MAX = 1000

const roleColors = {
  'Frontend UI/UX Developer': { bg: '#fff7ed', accent: '#c17f4a' },
  'Frontend Dashboard Developer': { bg: '#fff1f2', accent: '#be123c' },
  'Database Integrator': { bg: '#f0fdf4', accent: '#16a34a' },
  'Backend Developer': { bg: '#eff6ff', accent: '#2563eb' },
  'API Integrator': { bg: '#fdf4ff', accent: '#9333ea' },
}

const programmerAssets = {
  bautista: { photo: imageBautista, resume: resumeBautista },
  lopez: { photo: imageLopez, resume: resumeLopez },
  aquino: { photo: imageAquino, resume: resumeAquino },
  bernal: { photo: imageBernal, resume: resumeBernal },
  francisco: { photo: imageFrancisco, resume: resumeFrancisco },
}

const programmers = programmerProfiles.map((profile) => ({
  ...profile,
  photo: programmerAssets[profile.id]?.photo || '',
  resume: programmerAssets[profile.id]?.resume || '',
}))

const normalizeScroll = (position, loopSize) => {
  if (!loopSize) {
    return 0
  }

  return ((position % loopSize) + loopSize) % loopSize
}

function AboutProgrammersPage() {
  const carouselRef = useRef(null)
  const trackRef = useRef(null)
  const primarySetRef = useRef(null)
  const loopSizeRef = useRef(0)
  const resumeTimerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const previousFrameTimeRef = useRef(0)
  const [sliderValue, setSliderValue] = useState(0)
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false)

  const pauseAutoScroll = () => {
    window.clearTimeout(resumeTimerRef.current)
    setIsAutoScrollPaused(true)
  }

  const syncLoopSize = () => {
    const carousel = carouselRef.current
    const track = trackRef.current
    const primarySet = primarySetRef.current

    if (!carousel || !track || !primarySet) {
      return
    }

    const computedStyles = window.getComputedStyle(track)
    const gap = Number.parseFloat(computedStyles.columnGap || computedStyles.gap || '0') || 0
    const previousLoopSize = loopSizeRef.current
    const nextLoopSize = primarySet.scrollWidth + gap

    if (!nextLoopSize) {
      return
    }

    const normalizedPosition = normalizeScroll(
      carousel.scrollLeft,
      previousLoopSize || nextLoopSize,
    )

    loopSizeRef.current = nextLoopSize
    carousel.scrollLeft = normalizedPosition
    setSliderValue(Math.round((normalizedPosition / nextLoopSize) * SLIDER_MAX))
  }

  const scheduleAutoResume = () => {
    window.clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = window.setTimeout(() => {
      setIsAutoScrollPaused(false)
    }, AUTO_RESUME_DELAY)
  }

  useEffect(() => {
    syncLoopSize()
    window.addEventListener('resize', syncLoopSize)
    window.addEventListener('load', syncLoopSize)

    return () => {
      window.removeEventListener('resize', syncLoopSize)
      window.removeEventListener('load', syncLoopSize)
    }
  }, [])

  useEffect(() => {
    const carousel = carouselRef.current

    if (!carousel) {
      return undefined
    }

    const syncSlider = () => {
      const loopSize = loopSizeRef.current

      if (!loopSize) {
        return
      }

      const nextValue = Math.round(
        (normalizeScroll(carousel.scrollLeft, loopSize) / loopSize) * SLIDER_MAX,
      )

      setSliderValue((currentValue) => (currentValue === nextValue ? currentValue : nextValue))
    }

    carousel.addEventListener('scroll', syncSlider, { passive: true })
    syncSlider()

    return () => {
      carousel.removeEventListener('scroll', syncSlider)
    }
  }, [])

  useEffect(() => {
    const animate = (timestamp) => {
      const carousel = carouselRef.current
      const loopSize = loopSizeRef.current

      if (!previousFrameTimeRef.current) {
        previousFrameTimeRef.current = timestamp
      }

      const elapsed = timestamp - previousFrameTimeRef.current
      previousFrameTimeRef.current = timestamp

      if (carousel && loopSize && !isAutoScrollPaused) {
        carousel.scrollLeft += (AUTO_SCROLL_SPEED * elapsed) / 1000

        if (carousel.scrollLeft >= loopSize) {
          carousel.scrollLeft -= loopSize
        }
      }

      animationFrameRef.current = window.requestAnimationFrame(animate)
    }

    animationFrameRef.current = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current)
      previousFrameTimeRef.current = 0
    }
  }, [isAutoScrollPaused])

  useEffect(() => {
    return () => {
      window.clearTimeout(resumeTimerRef.current)
    }
  }, [])

  const handleSliderChange = (event) => {
    const nextValue = Number(event.target.value)
    const carousel = carouselRef.current
    const loopSize = loopSizeRef.current

    setSliderValue(nextValue)
    pauseAutoScroll()

    if (carousel && loopSize) {
      carousel.scrollLeft = (loopSize * nextValue) / SLIDER_MAX
    }

    scheduleAutoResume()
  }

  return (
    <div className="info-page programmer-carousel-page">
      <section className="info-page__hero programmer-carousel-page__hero">
        <h1>About the Programmers</h1>
        <p>
          Meet the team behind Eventcinity - five developers who built the platform from
          the ground up, each owning a key layer of the stack.
        </p>
      </section>

      <section className="programmer-carousel-section">
        <div ref={carouselRef} className="programmer-carousel">
          <div ref={trackRef} className="programmer-carousel__track">
            {[0, 1].map((setIndex) => (
              <div
                key={`set-${setIndex}`}
                ref={setIndex === 0 ? primarySetRef : null}
                className="programmer-carousel__set"
                aria-hidden={setIndex === 1}
              >
                {programmers.map((profile) => {
                  const colors = roleColors[profile.role] || { bg: '#f5f2ee', accent: '#7a7068' }

                  return (
                    <article key={`${setIndex}-${profile.id}`} className="info-card programmer-card">
                      <div className="programmer-card__media" style={{ background: colors.bg }}>
                        <img
                          className="programmer-card__avatar"
                          src={profile.photo}
                          alt={profile.name}
                          onLoad={syncLoopSize}
                        />
                      </div>

                      <span
                        className="programmer-card__role programmer-card__role--pill"
                        style={{ background: colors.bg, color: colors.accent }}
                      >
                        {profile.role}
                      </span>

                      <h2 className="programmer-card__name">{profile.name}</h2>
                      <p className="programmer-card__summary">{profile.summary}</p>

                      <a
                        className="programmer-card__cv"
                        href={profile.resume}
                        target="_blank"
                        rel="noreferrer"
                        tabIndex={setIndex === 1 ? -1 : undefined}
                      >
                        Check CV
                      </a>
                    </article>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="programmer-carousel__controls">
          <input
            id="programmer-carousel-slider"
            className="programmer-carousel__slider"
            type="range"
            min="0"
            max={SLIDER_MAX}
            step="1"
            value={sliderValue}
            aria-label="Programmer carousel slider"
            onChange={handleSliderChange}
          />
        </div>
      </section>

      <section className="info-page__grid">
        <article className="info-card">
          <h2>Project focus</h2>
          <p>
            Eventcinity is designed as a calmer alternative to louder event discovery
            interfaces, combining clean browsing, social actions, and a scalable path
            toward live event data.
          </p>
        </article>
        <article className="info-card">
          <h2>Current stack</h2>
          <p>
            The project uses a Vite React frontend with modular JSX components and a
            backend-ready structure that can grow into fuller API and auth workflows.
          </p>
        </article>
        <article className="info-card">
          <h2>Built with care</h2>
          <p>
            Every layer - from the UI to the database - was handled by a dedicated team
            member, keeping responsibilities clear and the codebase easy to maintain and
            extend.
          </p>
        </article>
      </section>

      <style>{`
        .programmer-carousel-page {
          gap: 32px;
        }

        .programmer-carousel-page__hero {
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
        }

        .programmer-carousel-section {
          display: grid;
          gap: 18px;
          padding: 28px;
          width: min(100%, 1220px);
          margin: 0 auto;
          border: 1px solid rgba(45, 59, 21, 0.1);
          border-radius: 32px;
          background:
            radial-gradient(circle at top left, rgba(237, 237, 237, 0.65), transparent 30%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 245, 245, 0.95));
          box-shadow: 0 24px 60px rgba(71, 53, 31, 0.08);
        }

        .programmer-carousel {
          overflow-x: auto;
          padding: 8px 0 16px;
          scrollbar-width: none;
        }

        .programmer-carousel::-webkit-scrollbar {
          display: none;
        }

        .programmer-carousel__track {
          display: flex;
          gap: 24px;
          width: max-content;
        }

        .programmer-carousel__set {
          display: flex;
          gap: 24px;
        }

        .programmer-card {
          flex: 0 0 clamp(280px, 28vw, 350px);
          gap: 14px;
          padding: 24px;
          border: 1px solid rgba(45, 59, 21, 0.1);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 16px 40px rgba(71, 53, 31, 0.08);
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }

        .programmer-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 44px rgba(71, 53, 31, 0.12);
        }

        .programmer-card__media {
          width: 148px;
          height: 148px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          padding: 8px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.75);
        }

        .programmer-card__avatar {
          width: 132px;
          height: 132px;
          border-radius: 50%;
          object-fit: cover;
          object-position: center;
          box-shadow: 0 12px 24px rgba(47, 36, 24, 0.18);
          background: #f5f2ee;
        }

        .programmer-card__role--pill {
          display: inline-flex;
          width: max-content;
          min-height: 32px;
          align-items: center;
          padding: 0 12px;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .programmer-card__name {
          margin: 0;
          font-size: 1.38rem;
          line-height: 1.15;
        }

        .programmer-card__summary {
          margin: 0;
          color: var(--color-muted);
          line-height: 1.75;
          min-height: 112px;
        }

        .programmer-card__cv {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 999px;
          background: var(--color-accent);
          color: var(--color-surface);
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .programmer-card__cv:hover {
          transform: translateY(-1px);
          opacity: 0.92;
        }

        .programmer-carousel__controls {
          display: grid;
          justify-items: center;
        }

        .programmer-carousel__slider {
          width: min(100%, 720px);
          accent-color: var(--color-accent);
          cursor: pointer;
        }

        @media (max-width: 980px) {
          .programmer-carousel-section {
            padding: 22px;
          }

          .programmer-card {
            flex-basis: min(82vw, 320px);
          }
        }

        @media (max-width: 680px) {
          .programmer-carousel-page {
            gap: 24px;
          }

          .programmer-carousel-section {
            padding: 18px;
            border-radius: 24px;
          }

          .programmer-card {
            flex-basis: 84vw;
            padding: 20px;
          }

          .programmer-card__media {
            width: 132px;
            height: 132px;
          }

          .programmer-card__avatar {
            width: 118px;
            height: 118px;
          }

          .programmer-card__summary {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  )
}

export default AboutProgrammersPage
