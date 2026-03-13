# ScrollTail v2

Class-based scroll animation library for HTML5 banners and web pages.
Powered by GSAP ScrollTrigger — works in ad servers (Google, Adform) via IntersectionObserver fallback.

---

## Setup

Add to your HTML `<head>`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/intergraphicsDev/ScrollTail@2.0/dist/scrolltail.min.js"></script>
```

Add classes to elements. No JavaScript required.

---

## Quick start

```html
<!-- Fade in and out with scroll (all defaults) -->
<div class="st-scroll st-fade">...</div>

<!-- Slide up, play once -->
<div class="st-scroll st-slide-up st-once st-dur-600 st-ease-spring">...</div>

<!-- Smooth scrub with lag -->
<div class="st-scroll st-fade st-scrub-1">...</div>

<!-- Sequence: elements play one after another -->
<div class="st-scroll st-fade st-once st-order-1">First</div>
<div class="st-scroll st-slide-up st-once st-dur-600 st-order-2">Second</div>
<div class="st-scroll st-scale st-once st-dur-600 st-order-3 st-delay-200">Third</div>
```

---

## Class reference

### Activation (required)
| Class | Description |
|---|---|
| `st-scroll` | Activates ScrollTail on the element |

### Animation
| Class | Effect |
|---|---|
| `st-fade` | Fade in/out |
| `st-slide-up` | Move upward |
| `st-slide-down` | Move downward |
| `st-slide-left` | Move left |
| `st-slide-right` | Move right |
| `st-parallax-up` | Subtle upward movement without fade |
| `st-parallax-down` | Subtle downward movement without fade |
| `st-parallax-left` | Subtle left movement without fade |
| `st-parallax-right` | Subtle right movement without fade |
| `st-scale` | Scale from 0 |
| `st-blur` | Unblur from blurred |
| `st-rotate` | Rotate in |

### Direction
| Class | Effect |
|---|---|
| *(none)* | From outside → to position (default) |
| `st-to` | From position → out |
| `st-from st-to` | From outside → through position → out |

### Scroll type
| Class | Behavior |
|---|---|
| *(none)* | Scrub forward and backward (default) |
| `st-once` | Play once, stay visible |
| `st-forward` | Play forward, reset on scroll back |
| `st-reverse` | Start visible, disappear on scroll down |

### Scrub lag
| Class | Lag |
|---|---|
| *(none)* | Instant 1:1 (default) |
| `st-scrub-1` | 1s lag |
| `st-scrub-2` | 2s lag |

### Start / End (% from top of viewport)
| Class | Position |
|---|---|
| `st-start-100` | Bottom of viewport |
| `st-start-80` | 80% down — **default** |
| `st-start-50` | Center |
| `st-start-20` | 20% from top |
| `st-end-80` | 80% down |
| `st-end-50` | Center |
| `st-end-20` | 20% from top — **default** |
| `st-end-0` | Top of viewport |

### Distance
| Class | Distance |
|---|---|
| `st-dist-20` | 20px |
| `st-dist-40` | 40px (default) |
| `st-dist-80` | 80px |
| `st-dist-120` | 120px |

### Pin
| Class | Effect |
|---|---|
| `st-pin` | Pin element while scrolling past (not available in iframes) |

### Duration (with `st-once`)
`st-dur-300` / `st-dur-600` / `st-dur-1000` / `st-dur-1600`

### Easing (with `st-once`)
`st-ease-linear` / `st-ease-in` / `st-ease-out` / `st-ease-in-out` / `st-ease-bounce` / `st-ease-spring`

### Sequence (with `st-once` + `st-order-*`)
| Class | Effect |
|---|---|
| `st-order-1` → `st-order-6` | Play order in timeline |
| `st-delay-100/200/300/500` | Extra pause after previous |
| `st-overlap-100/200/300/500` | Start before previous finishes |

---

## Ad server compatibility

ScrollTail auto-detects iframe environments (Google, Adform) and switches to IntersectionObserver as a scroll proxy. Same classes work in both environments.

| Feature | Self-hosted | Iframe (ad server) |
|---|---|---|
| Scrub | ScrollTrigger | IO intersectionRatio |
| `st-once` | ScrollTrigger | IO threshold |
| `st-pin` | ScrollTrigger | Ignored |

---

## JavaScript API

```javascript
ScrollTail.refresh()   // Re-scan DOM and rebuild all triggers
ScrollTail.destroy()   // Remove all triggers and tweens
ScrollTail.pause()     // Pause all animations
ScrollTail.resume()    // Resume all animations
```

---

## License

MIT
