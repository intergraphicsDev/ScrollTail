# ScrollTail v2 — Product Requirements Document

## 1. Formål

ScrollTail er et class-baseret scroll-animationsbibliotek til HTML5-bannere og simple websider. Designere tilføjer klasser på elementer — ingen JavaScript nødvendigt.

Inspireret af Tailwinds utility-first tilgang: kombiner præcise klasser til præcis adfærd.

---

## 2. Teknisk fundament

| Komponent | Rolle |
|---|---|
| GSAP core | Tween- og timeline-motor |
| GSAP ScrollTrigger | Scroll-binding, scrub, pin, toggleActions |
| ScrollTail | Klasse-parser + konfigurationslag |

ScrollTrigger er **required** i v2. IntersectionObserver bruges som fallback i iframe-miljøer (adservere), kombineret med postMessage-scrub fra host-siden.

### CDN-setup
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/intergraphicsDev/ScrollTail@2.0/dist/scrolltail.min.js"></script>
```

---

## 3. Klassestruktur

### Aktivering
`st-scroll` er påkrævet på alle elementer. ScrollTail scanner kun `.st-scroll`.

### Animation
Definerer det visuelle. Kombineres med retning.

```
st-fade       opacity 0 ↔ 1
st-slide-up   y: +move ↔ 0
st-slide-down y: -move ↔ 0
st-slide-left x: +move ↔ 0
st-slide-right x: -move ↔ 0
st-scale      scale: 0, opacity: 0 ↔ natural
st-blur       filter: blur(12px), opacity: 0 ↔ natural
st-rotate     rotation: -15, opacity: 0 ↔ natural
```

### Retning
Bestemmer om animationen er `gsap.from()`, `gsap.to()` eller `gsap.fromTo()`.

```
(ingen)          gsap.from()   — fra udenfor ind til placering (default)
st-to            gsap.to()     — fra placering og ud
st-from st-to    gsap.fromTo() — starter udenfor, passerer igennem og ud
```

### Scroll-type → toggleActions

```
(ingen)    scrub: true                                       (frem+tilbage, default)
st-once    once: true                                        (én gang)
st-reset   toggleActions: "play none none reset"             (frem, nulstil)
st-exit    toggleActions: "reverse play play reverse"        (starter synlig, forsvinder)
```

### Scrub-lag

```
(ingen)      scrub: true    (instant, default)
st-scrub-1   scrub: 1       (1 sek lag)
st-scrub-2   scrub: 2       (2 sek lag)
```

### Start og End
Beskriver hvornår ScrollTrigger aktiveres/deaktiveres.
Tallet = % fra toppen af viewport.

```
st-start-100  start: "top 100%"   (rammer bunden)
st-start-80   start: "top 80%"    (default)
st-start-50   start: "top 50%"
st-start-20   start: "top 20%"

st-end-80     end: "bottom 80%"
st-end-50     end: "bottom 50%"
st-end-20     end: "bottom 20%"   (default)
st-end-0      end: "bottom 0%"
```

### Move

```
st-move-20    20px
st-move-40    40px (default)
st-move-80    80px
st-move-120   120px
```

### Edge — animér til containerkant

Beregner automatisk afstand fra elementets naturlige position til Npx fra containerens kant. Kanten bestemmes af animationstype:

```
st-slide-down + st-edge-*   → bund af container
st-slide-up   + st-edge-*   → top af container
st-slide-left + st-edge-*   → venstre kant
st-slide-right + st-edge-*  → højre kant
```

Implementering i `edgeDistance(el, anim, offset)`:
```javascript
case 'st-slide-down':  return container.offsetHeight - (el.offsetTop + el.offsetHeight) - offset
case 'st-slide-up':    return -(el.offsetTop - offset)
case 'st-slide-left':  return -(el.offsetLeft - offset)
case 'st-slide-right': return container.offsetWidth - (el.offsetLeft + el.offsetWidth) - offset
```

`st-edge-*` er altid `gsap.to()` — elementet starter på sin placering og animerer til kanten. `st-move-*` ignoreres når `st-edge-*` er sat.

### Pin

```
st-pin   pin: true (pinSpacing: true)
```

### Debug

```
st-debug   markers: true (kun ScrollTrigger, ignoreres i iframes)
```

### Duration og Ease (kun med st-once)

```
st-dur-300 / 600 / 1000 / 1600    seconds: 0.3 / 0.6 / 1.0 / 1.6
st-ease-linear / in / out / in-out / bounce / spring
```

### Delay og Overlap (sekvens, kun med st-once + st-order-*)

```
st-delay-100 / 200 / 300 / 500    GSAP position: "+=0.1" osv.
st-overlap-100 / 200 / 300 / 500  GSAP position: "-=0.1" osv.
st-order-1 → st-order-6           Rækkefølge i GSAP timeline
```

---

## 4. Arkitektur

```
init()
  ↓
Scan alle .st-scroll elementer
  ↓
parseClasses(el) → config objekt (én gang per element via Map)
  ↓
┌─────────────────┬──────────────────┐
│ st-order-* ?    │ Ingen order      │
│ buildTimeline() │ buildElement()   │
└────────┬────────┴────────┬─────────┘
         │                 │
    GSAP timeline    st-pin ?
    + ScrollTrigger  ├─ Ja → ScrollTrigger pin:true
                     └─ Nej → ScrollTrigger.create()
                                retning: from/to/fromTo
                                scrub / toggleActions
                                start / end / markers
```

### parseClasses(el) → config

```javascript
{
  anim:    'st-fade' | 'st-slide-up' | ... | null,
  hasTo:   boolean,
  hasFrom: boolean,   // default true hvis ingen st-to
  once:    boolean,
  reset:   boolean,
  exit:    boolean,
  scrub:   true | 1 | 2,
  start:   80,        // % — default 80
  end:     20,        // % — default 20
  move:    40,        // px — default 40
  dur:     0.6,       // sek — default 0.6
  ease:    'power2.out',
  delay:   0,
  overlap: null,
  order:   null | 1–6,
  pin:     boolean,
  debug:   boolean
}
```

### buildElement(el, config)

1. Beregn `hiddenVars` og `visibleVars` ud fra `anim` + `move`
2. Vælg `gsap.from()` / `gsap.to()` / `gsap.fromTo()` ud fra `hasFrom`/`hasTo`
3. Opret ScrollTrigger med `start`, `end`, `scrub`, `toggleActions`, `pin`, `markers`

### buildTimeline(orderedEls, configs)

1. Sorter efter `st-order-*` via forudparsed configs-Map
2. Byg GSAP timeline med `delay`/`overlap` som position-strings
3. Tilknyt ét ScrollTrigger til `order-1` elementet

---

## 5. Defaults

| Parameter | Default | Klasse |
|---|---|---|
| Scroll-type | scrub frem+tilbage | *(ingen)* |
| Start | 80% fra top | *(ingen)* |
| End | 20% fra top | *(ingen)* |
| Move | 40px | *(ingen)* |
| Duration | 600ms | *(ingen)* |
| Ease | power2.out | *(ingen)* |
| Retning | from | *(ingen)* |

---

## 6. Constraints

- **Hype DOM**: Alle elementer er sibling-noder. `st-order-*` håndterer sekvens uden nesting.
- **iframe**: ScrollTrigger kræver adgang til parent-scroll. I iframe-bannere (Adform, Google) skifter ScrollTail automatisk til IntersectionObserver. Scrub drives via `postMessage` fra host-siden (`{ type: 'scrolltail-ratio', ratio: 0–1 }`). Tidsbaserede animationer (`st-once`, `st-reset`, `st-exit`) bruger IO-threshold direkte. `st-pin` og `st-debug` ignoreres i iframes.
- **prefers-reduced-motion**: Alle animationer deaktiveres automatisk.
- **Størrelse**: Mål < 2 KB gzipped for `scrolltail.min.js` (ekskl. GSAP).

---

## 7. Public API

```javascript
ScrollTail.refresh()        // Genscanner DOM og genopretter alle ScrollTriggers
ScrollTail.destroy()        // Fjerner alle ScrollTriggers og tweens
ScrollTail.pause()          // Pauser alle animationer
ScrollTail.resume()         // Genoptager alle animationer
ScrollTail.setScroller(el)  // Sætter custom scroll-container (fx indre banner-div)
```

---

## 8. Filstruktur

```
ScrollTail/
├── src/
│   └── scrolltail.js      Kildekode
├── dist/
│   └── scrolltail.min.js  Bygget IIFE til CDN
├── docs/
│   ├── PRD.md             Dette dokument
│   └── CHEATSHEET.md      Designerreference
├── package.json
└── vite.config.js
```

---

## 9. Versionshistorik

| Version | Ændringer |
|---|---|
| v1.0 | IntersectionObserver + GSAP, st-fade-up klasser |
| v2.0 | ScrollTrigger som motor, ny klassestruktur, st-scroll aktivering, from/to/fromTo, start/end som %, pin |
| v2.1 | Fjern st-parallax-*, omdøb st-dist→st-move og st-forward/reverse→st-reset/exit, tilføj st-debug |
