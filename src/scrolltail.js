/**
 * ScrollTail v2.0
 * Class-based scroll animation library for HTML5 banners and web pages.
 * Powered by GSAP ScrollTrigger (self-hosted) + IntersectionObserver (iframe fallback).
 */

// --- Environment ----------------------------------------------------------

const isIframe      = window.self !== window.top
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// --- Class maps -----------------------------------------------------------

const ANIM_TYPES  = [
  'st-fade',
  'st-slide-up',
  'st-slide-down',
  'st-slide-left',
  'st-slide-right',
  'st-parallax-up',
  'st-parallax-down',
  'st-parallax-left',
  'st-parallax-right',
  'st-scale',
  'st-blur',
  'st-rotate'
]
const DIST_MAP    = { 'st-dist-20': 20, 'st-dist-40': 40, 'st-dist-80': 80, 'st-dist-120': 120 }
const DUR_MAP     = { 'st-dur-300': 0.3, 'st-dur-600': 0.6, 'st-dur-1000': 1.0, 'st-dur-1600': 1.6 }
const EASE_MAP    = {
  'st-ease-linear':  'none',
  'st-ease-in':      'power2.in',
  'st-ease-out':     'power2.out',
  'st-ease-in-out':  'power2.inOut',
  'st-ease-bounce':  'back.out(1.7)',
  'st-ease-spring':  'elastic.out(1, 0.5)'
}
const DELAY_MAP   = { 'st-delay-100': 0.1, 'st-delay-200': 0.2, 'st-delay-300': 0.3, 'st-delay-500': 0.5 }
const OVERLAP_MAP = { 'st-overlap-100': -0.1, 'st-overlap-200': -0.2, 'st-overlap-300': -0.3, 'st-overlap-500': -0.5 }
const START_MAP   = { 'st-start-100': 100, 'st-start-80': 80, 'st-start-50': 50, 'st-start-20': 20 }
const END_MAP     = { 'st-end-80': 80, 'st-end-50': 50, 'st-end-20': 20, 'st-end-0': 0 }
const EDGE_MAP    = { 'st-edge-0': 0, 'st-edge-5': 5, 'st-edge-10': 10, 'st-edge-20': 20 }

// --- State ----------------------------------------------------------------

let triggers   = []   // ScrollTrigger instances
let observers  = []   // IntersectionObserver instances
let animations = []   // GSAP tweens and timelines
let scrubQueue = []   // {animation, config} pairs driven by postMessage ratio in iframe mode
let isPaused   = false
let scrollerEl = null // Custom scroller element (e.g. inner banner div)

// In iframe mode: listen for ratio from host page (sent via postMessage).
// Host page should send { type: 'scrolltail-ratio', ratio: 0–1 } on scroll.
if (isIframe) {
  window.addEventListener('message', e => {
    if (e.data?.type !== 'scrolltail-ratio' || isPaused) return
    const ratio = Math.min(1, Math.max(0, e.data.ratio))
    scrubQueue.forEach(({ animation, config }) =>
      animation.progress(ioProgress(config, ratio))
    )
  })
}

// --- parseClasses ---------------------------------------------------------

function parseClasses(el) {
  const cls  = el.classList
  const pick = map => Object.entries(map).find(([k]) => cls.contains(k))?.[1]
  const hasTo = cls.contains('st-to')
  const orderMatch = [...cls].find(c => /^st-order-(\d+)$/.test(c))

  return {
    anim:    ANIM_TYPES.find(t => cls.contains(t)) ?? null,
    dist:    pick(DIST_MAP)    ?? 40,
    dur:     pick(DUR_MAP)     ?? 0.6,
    ease:    pick(EASE_MAP)    ?? 'power2.out',
    delay:   pick(DELAY_MAP)   ?? 0,
    overlap: pick(OVERLAP_MAP) ?? null,
    start:   pick(START_MAP)   ?? 80,
    end:     pick(END_MAP)     ?? 20,
    edge:    pick(EDGE_MAP)    ?? null,
    hasTo,
    hasFrom: cls.contains('st-from') || !hasTo,  // default: from
    once:    cls.contains('st-once'),
    forward: cls.contains('st-forward'),
    reverse: cls.contains('st-reverse'),
    pin:     cls.contains('st-pin'),
    scrub:   cls.contains('st-scrub-2') ? 2 : cls.contains('st-scrub-1') ? 1 : true,
    order:   orderMatch ? parseInt(orderMatch.replace('st-order-', ''), 10) : null
  }
}

// --- Animation helpers ----------------------------------------------------

// GSAP vars for the "hidden" start state of each animation type
function hiddenVars(anim, dist) {
  switch (anim) {
    case 'st-fade':        return { opacity: 0 }
    case 'st-slide-up':    return { y: dist, opacity: 0 }
    case 'st-slide-down':  return { y: -dist, opacity: 0 }
    case 'st-slide-left':  return { x: dist, opacity: 0 }
    case 'st-slide-right': return { x: -dist, opacity: 0 }
    case 'st-parallax-up':    return { y: dist }
    case 'st-parallax-down':  return { y: -dist }
    case 'st-parallax-left':  return { x: dist }
    case 'st-parallax-right': return { x: -dist }
    case 'st-scale':       return { scale: 0, opacity: 0 }
    case 'st-blur':        return { filter: 'blur(12px)', opacity: 0 }
    case 'st-rotate':      return { rotation: -15, opacity: 0 }
    default:               return { opacity: 0 }
  }
}

// Inverse of hiddenVars — the natural visible state
function visibleVars(hidden) {
  return Object.fromEntries(
    Object.keys(hidden).map(k => [k, k === 'opacity' ? 1 : k === 'filter' ? 'blur(0px)' : 0])
  )
}

// Px distance from element's position to Npx from its container edge.
// Direction is inferred from the animation type.
function edgeDistance(el, anim, offset) {
  const container = el.offsetParent || el.parentElement
  if (!container) return 0
  switch (anim) {
    case 'st-slide-down':  return container.offsetHeight - (el.offsetTop + el.offsetHeight) - offset
    case 'st-slide-up':    return -(el.offsetTop - offset)
    case 'st-slide-left':  return -(el.offsetLeft - offset)
    case 'st-slide-right': return container.offsetWidth - (el.offsetLeft + el.offsetWidth) - offset
    default:               return 0
  }
}

// --- buildTween -----------------------------------------------------------
// Returns a GSAP tween for one element based on its config.

function buildTween(el, config, paused = true) {
  const { anim, dist, dur, ease, hasFrom, hasTo, edge } = config
  const opts = { duration: dur, ease, paused }

  if (edge !== null) {
    const target = edgeDistance(el, anim, edge)
    const prop   = ['st-slide-up', 'st-slide-down'].includes(anim) ? 'y' : 'x'
    return gsap.to(el, { [prop]: target, ...opts })
  }

  const hidden = hiddenVars(anim, dist)
  if (hasFrom && hasTo) return gsap.fromTo(el, hidden, { ...visibleVars(hidden), ...opts })
  if (hasTo)            return gsap.to(el,     { ...hidden, ...opts })
  return                       gsap.from(el,   { ...hidden, ...opts })
}

// --- toggleActions --------------------------------------------------------
// Maps scroll-type classes to GSAP toggleActions string.

function toggleActions(config) {
  if (config.once)    return 'play none none none'
  if (config.forward) return 'play none none reset'
  if (config.reverse) return 'reverse play play reverse'
  return 'play reverse reverse reverse'
}

// --- stConfig -------------------------------------------------------------
// Shared ScrollTrigger config for single elements and timelines.

function stConfig(trigger, config, animation) {
  const isTimeBased = config.once || config.forward || config.reverse
  return {
    trigger,
    start:   `top ${config.start}%`,
    end:     `bottom ${config.end}%`,
    animation,
    ...(scrollerEl ? { scroller: scrollerEl } : {}),
    ...(isTimeBased
      ? { toggleActions: toggleActions(config), once: config.once }
      : { scrub: config.scrub }
    )
  }
}

// --- IO helpers -----------------------------------------------------------

// Maps intersectionRatio (0–1) to GSAP animation progress (0–1).
// st-to:   ratio 1→endRatio maps to progress 0→1 (animate out while still visible)
// st-from: ratio startRatio→1 maps to progress 0→1 (animate in as element enters)
function ioProgress(config, ratio) {
  if (config.hasTo && !config.hasFrom) {
    const endRatio = Math.max((config.end ?? 20) / 100, 0.01)
    return Math.min(1, Math.max(0, (1 - ratio) / (1 - endRatio)))
  }
  const startRatio = Math.min((100 - config.start) / 100, 0.99)
  return Math.min(1, Math.max(0, (ratio - startRatio) / (1 - startRatio)))
}

// --- buildIOObserver ------------------------------------------------------
// Scrub: registers animation in scrubQueue (driven by postMessage from host).
//        Falls back to IO with fine-grained thresholds if no postMessage.
// Time-based (once/forward/reverse): uses a single IO threshold to play/reverse.

function buildIOObserver(el, config, animation) {
  const isScrub = !config.once && !config.forward && !config.reverse
  const IO_STEPS = Array.from({ length: 21 }, (_, i) => i / 20)

  if (isScrub) {
    // Primary: postMessage from host page drives progress smoothly
    scrubQueue.push({ animation, config })

    // Fallback: IO ratio updates (coarser, ~5% steps)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (isPaused) return
        animation.progress(ioProgress(config, entry.intersectionRatio))
      })
    }, { threshold: IO_STEPS })

    io.observe(el)
    observers.push(io)
  } else {
    // Time-based: play/reverse on threshold crossing
    const isTo    = config.hasTo && !config.hasFrom
    const trigger = isTo
      ? Math.min(Math.max(config.start / 100, 0.05), 1)
      : Math.min(Math.max(1 - config.start / 100, 0), 0.95)

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (isPaused) return
        const leaving = entry.intersectionRatio < trigger

        if (isTo) {
          if (leaving) {
            animation.play()
            if (config.once) io.unobserve(el)
          } else if (!config.once) {
            animation.reverse()
          }
        } else {
          if (!leaving) {
            animation.play()
            if (config.once) io.unobserve(el)
          } else if (config.forward) {
            animation.pause(0)
          } else if (config.reverse) {
            animation.reverse()
          } else if (!config.once) {
            animation.pause(0)
          }
        }
      })
    }, { threshold: [trigger] })

    io.observe(el)
    observers.push(io)
  }
}

// --- buildElement ---------------------------------------------------------

function buildElement(el, config) {
  // Pin: lock element in place — only outside iframes
  if (config.pin && !isIframe) {
    triggers.push(ScrollTrigger.create({
      trigger: el,
      start:   `top ${config.start}%`,
      end:     `bottom ${config.end}%`,
      pin:     true,
      pinSpacing: true,
      ...(scrollerEl ? { scroller: scrollerEl } : {})
    }))
    return
  }

  const tween = buildTween(el, config)
  animations.push(tween)

  if (isIframe || typeof ScrollTrigger === 'undefined') {
    buildIOObserver(el, config, tween)
  } else {
    triggers.push(ScrollTrigger.create(stConfig(el, config, tween)))
  }
}

// --- buildTimeline --------------------------------------------------------
// Groups st-order-* elements into a single sequenced GSAP timeline.

function buildTimeline(orderedEls) {
  const sorted      = [...orderedEls].sort((a, b) => parseClasses(a).order - parseClasses(b).order)
  const firstEl     = sorted[0]
  const firstConfig = parseClasses(firstEl)

  const tl = gsap.timeline({ paused: true })

  sorted.forEach(el => {
    const config   = parseClasses(el)
    const tween    = buildTween(el, config, false)
    const position = config.overlap !== null ? `${config.overlap}`
                   : config.delay > 0        ? `+=${config.delay}`
                   : undefined
    tl.add(tween, position)
  })

  animations.push(tl)

  if (isIframe || typeof ScrollTrigger === 'undefined') {
    buildIOObserver(firstEl, firstConfig, tl)
  } else {
    triggers.push(ScrollTrigger.create(stConfig(firstEl, firstConfig, tl)))
  }
}

// --- init -----------------------------------------------------------------

function init() {
  if (!window.gsap) {
    console.warn('ScrollTail: GSAP not found. Add gsap before scrolltail.')
    return
  }
  if (reducedMotion) return
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger)

  const allEls = [...document.querySelectorAll('.st-scroll')]
  if (!allEls.length) return

  const orderedEls = allEls.filter(el => parseClasses(el).order !== null)
  const singleEls  = allEls.filter(el => parseClasses(el).order === null)

  singleEls.forEach(el => buildElement(el, parseClasses(el)))
  if (orderedEls.length) buildTimeline(orderedEls)
}

// --- Public API -----------------------------------------------------------

function setScroller(el) { scrollerEl = el || null }

function refresh() { destroy(); init() }

function pause() {
  isPaused = true
  animations.forEach(a => a.pause())
}

function resume() {
  isPaused = false
  animations.forEach(a => a.play())
}

function destroy() {
  triggers.forEach(st => st.kill())
  observers.forEach(io => io.disconnect())
  animations.forEach(a => a.kill())
  triggers   = []
  observers  = []
  animations = []
  scrubQueue = []
}

// --- Boot -----------------------------------------------------------------

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

export { setScroller, refresh, pause, resume, destroy }
