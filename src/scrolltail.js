/**
 * ScrollTail v1.0
 * Class-based scroll animation library for HTML5 banners
 * Powered by GSAP + IntersectionObserver
 */

// --- Constants -----------------------------------------------------------

const DIST  = { 'st-dist-sm': 20, 'st-dist-md': 40, 'st-dist-lg': 80, 'st-dist-xl': 120 }
const DUR   = { 'st-dur-300': 0.3, 'st-dur-600': 0.6, 'st-dur-1000': 1.0, 'st-dur-1600': 1.6 }
const DELAY = {
  'st-delay-0': 0, 'st-delay-100': 0.1, 'st-delay-200': 0.2,
  'st-delay-300': 0.3, 'st-delay-400': 0.4, 'st-delay-500': 0.5,
  'st-delay-750': 0.75, 'st-delay-1000': 1.0
}
const OVERLAP = {
  'st-overlap-100': -0.1, 'st-overlap-200': -0.2,
  'st-overlap-300': -0.3, 'st-overlap-500': -0.5
}
const EASE  = {
  'st-ease-linear':  'none',
  'st-ease-in':      'power2.in',
  'st-ease-out':     'power2.out',
  'st-ease-in-out':  'power2.inOut',
  'st-ease-bounce':  'back.out(1.7)',
  'st-ease-spring':  'elastic.out(1, 0.5)'
}
const VISIBLE = { 'st-visible-0': 0, 'st-visible-25': 0.25, 'st-visible-50': 0.5, 'st-visible-75': 0.75 }
const PARALLAX = { 'st-parallax-slow': 0.3, 'st-parallax-med': 0.6, 'st-parallax-fast': 1.4, 'st-parallax-reverse': -0.5 }

const ANIM_TYPES = [
  'st-fade', 'st-fade-up', 'st-fade-down', 'st-fade-left', 'st-fade-right',
  'st-slide-left', 'st-slide-right', 'st-scale', 'st-rotate', 'st-blur'
]

// IO threshold array [0, 0.05, 0.10, ..., 1.0] for scrub
const SCRUB_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20)

// --- State ----------------------------------------------------------------

let observers = []
let tweens    = []
let timelines = []
let paused    = false
const isIframe = window.self !== window.top

// --- parseClasses ---------------------------------------------------------

function parseClasses(el) {
  const cls = el.classList

  const type     = ANIM_TYPES.find(t => cls.contains(t)) || null
  const dist     = Object.entries(DIST).find(([k]) => cls.contains(k))?.[1]     ?? 40
  const dur      = Object.entries(DUR).find(([k]) => cls.contains(k))?.[1]      ?? 0.6
  const delay    = Object.entries(DELAY).find(([k]) => cls.contains(k))?.[1]    ?? 0
  const ease     = Object.entries(EASE).find(([k]) => cls.contains(k))?.[1]     ?? 'power2.out'
  const visible  = Object.entries(VISIBLE).find(([k]) => cls.contains(k))?.[1]  ?? 0.5
  const parallax = Object.entries(PARALLAX).find(([k]) => cls.contains(k))?.[1] ?? null

  const repeat  = cls.contains('st-repeat')
  const scroll  = cls.contains('st-scroll')
  const overlap = Object.entries(OVERLAP).find(([k]) => cls.contains(k))?.[1] ?? null

  const orderMatch = [...cls].find(c => /^st-order-(\d)$/.test(c))
  const order = orderMatch ? parseInt(orderMatch.replace('st-order-', ''), 10) : null

  return { type, dist, dur, delay, ease, visible, parallax, repeat, scroll, order, overlap }
}

// --- fromState ------------------------------------------------------------

function buildFromState(config) {
  const { type, dist } = config
  switch (type) {
    case 'st-fade':       return { opacity: 0 }
    case 'st-fade-up':    return { opacity: 0, y: dist }
    case 'st-fade-down':  return { opacity: 0, y: -dist }
    case 'st-fade-left':  return { opacity: 0, x: dist }
    case 'st-fade-right': return { opacity: 0, x: -dist }
    case 'st-slide-left': return { x: dist }
    case 'st-slide-right':return { x: -dist }
    case 'st-scale':      return { scale: 0, opacity: 0 }
    case 'st-rotate':     return { rotation: -15, opacity: 0 }
    case 'st-blur':       return { filter: 'blur(12px)', opacity: 0 }
    default:              return { opacity: 0 }
  }
}

// --- buildSingle ----------------------------------------------------------

function buildSingle(el, config) {
  if (config.scroll) {
    buildScrollScrub(el, config)
    return
  }

  const from = { ...buildFromState(config), duration: config.dur, ease: config.ease, paused: true }
  if (config.delay) from.delay = config.delay

  const tween = gsap.from(el, from)
  tweens.push(tween)

  const threshold = config.visible

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (paused) return
      if (entry.isIntersecting) {
        tween.restart()
        if (!config.repeat) io.unobserve(el)
      } else if (config.repeat) {
        tween.pause(0)
      }
    })
  }, { threshold })

  io.observe(el)
  observers.push(io)
}

// --- buildScrollScrub -----------------------------------------------------

function buildScrollScrub(el, config) {
  const from = { ...buildFromState(config), duration: config.dur, ease: config.ease, paused: true }
  const tl = gsap.timeline({ paused: true })

  if (config.parallax !== null) {
    // Parallax: move element at a different speed relative to scroll
    const yDist = 80 * config.parallax
    tl.fromTo(el,
      { y: -yDist },
      { y: yDist, duration: 1, ease: 'none' }
    )
  } else {
    tl.from(el, { ...buildFromState(config), duration: 1, ease: config.ease })
  }

  timelines.push(tl)

  if (!isIframe && typeof ScrollTrigger !== 'undefined') {
    // Outside iframe: use GSAP ScrollTrigger for pixel-perfect scrub
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: self => { if (!paused) tl.progress(self.progress) }
    })
  } else {
    // Inside iframe (or no ScrollTrigger): use intersectionRatio as proxy
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (paused) return
        tl.progress(entry.intersectionRatio)
      })
    }, { threshold: SCRUB_THRESHOLDS })

    io.observe(el)
    observers.push(io)
  }
}

// --- buildTimeline --------------------------------------------------------

function buildTimeline(orderedEls) {
  // Sort by st-order-* value
  const sorted = [...orderedEls].sort((a, b) => {
    return parseClasses(a).order - parseClasses(b).order
  })

  const tl = gsap.timeline({ paused: true })

  sorted.forEach(el => {
    const config = parseClasses(el)
    const from = buildFromState(config)
    const vars = { duration: config.dur, ease: config.ease }
    let position
    if (config.overlap !== null)  position = `${config.overlap}`  // e.g. "-=0.2"
    else if (config.delay > 0)    position = `+=${config.delay}`

    tl.from(el, { ...from, ...vars }, position)
  })

  timelines.push(tl)

  // Trigger on first element (lowest order)
  const firstEl = sorted[0]
  const firstConfig = parseClasses(firstEl)
  const threshold = firstConfig.visible

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (paused) return
      if (entry.isIntersecting) {
        tl.restart()
        if (!firstConfig.repeat) io.unobserve(firstEl)
      } else if (firstConfig.repeat) {
        tl.pause(0)
      }
    })
  }, { threshold })

  io.observe(firstEl)
  observers.push(io)
}

// --- prefers-reduced-motion -----------------------------------------------

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// --- init -----------------------------------------------------------------

function init() {
  if (!window.gsap) {
    console.warn('ScrollTail: GSAP not found. Include gsap before scrolltail.')
    return
  }

  if (reducedMotion) return

  const allEls = document.querySelectorAll(ANIM_TYPES.map(t => `.${t}`).join(','))
  if (!allEls.length) return

  // Separate ordered from non-ordered
  const orderedEls   = [...allEls].filter(el => parseClasses(el).order !== null)
  const singleEls    = [...allEls].filter(el => parseClasses(el).order === null)

  // Build single animations
  singleEls.forEach(el => {
    const config = parseClasses(el)
    buildSingle(el, config)
  })

  // Build timeline if any ordered elements exist
  if (orderedEls.length) {
    buildTimeline(orderedEls)
  }
}

// --- Public API -----------------------------------------------------------

function refresh() {
  destroy()
  init()
}

function pause() {
  paused = true
  tweens.forEach(t => t.pause())
  timelines.forEach(t => t.pause())
}

function resume() {
  paused = false
  tweens.forEach(t => t.play())
  timelines.forEach(t => t.play())
}

function destroy() {
  observers.forEach(io => io.disconnect())
  tweens.forEach(t => t.kill())
  timelines.forEach(t => t.kill())
  observers = []
  tweens    = []
  timelines = []
}

function setScroller(selector) {
  // For future ScrollTrigger scroller support
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.defaults({ scroller: selector })
  }
}

// --- Boot -----------------------------------------------------------------

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

export { refresh, pause, resume, destroy, setScroller }
