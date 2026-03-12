# ScrollTail — Class Reference

**Scroll-behaviors til HTML5 bannere**  
ScrollTail lytter på scroll. GSAP animerer. Hype håndterer alt andet.

---

## Hurtig start

```html
<!-- Head HTML (Hype: Document Inspector → Head HTML) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/moire/ScrollTail@1.0/dist/scrolltail.min.js"></script>

<!-- Klasser på element (Hype: Element Inspector → Additional HTML Attributes → class) -->
<div class="st-fade-up">Animeret element</div>
```

Et element med en `st-*` animationsklasse scroll-triggers automatisk. Ingen ekstra klasse kræves.

---

## Klasser

---

### 1. Animationstype — hvad sker der?

Vælg én. Elementet scroll-triggers automatisk.

| Klasse | Beskrivelse |
|---|---|
| `st-fade` | Fade ind |
| `st-fade-up` | Fade ind nedefra og op |
| `st-fade-down` | Fade ind ovenfra og ned |
| `st-fade-left` | Fade ind fra højre mod venstre |
| `st-fade-right` | Fade ind fra venstre mod højre |
| `st-slide-left` | Slide ind fra højre — ingen fade |
| `st-slide-right` | Slide ind fra venstre — ingen fade |
| `st-scale` | Skaler ind fra 0 |
| `st-rotate` | Rotér ind fra -15deg |
| `st-blur` | Fade ind fra sløret til skarp |

---

### 2. Scroll-adfærd — hvordan reagerer det på scroll?

Sættes **kun** når du vil afvige fra default.

| Klasse | Adfærd |
|---|---|
| *(ingen)* | Trigger én gang når elementet ses — **default** |
| `st-repeat` | Trigger igen ved hvert scroll ind og ud |
| `st-scroll` | Bind animation til scroll-position — kører frem og tilbage |

**`st-scroll` virker i alle banner-miljøer** — Google, Adform, Bannersnack og selvhostede sider.

I iframes bruges bannerets synlighed (0→100%) som scroll-proxy:
```
Banner glider ind i viewport  → animation kører frem
Banner forlader viewport      → animation kører baglæns
```

---

### 3. Rækkefølge — skal elementer kører efter hinanden?

Elementer med `st-order-*` samles i én GSAP timeline og kører sekventielt.  
Tidslinjen trigger når elementet med laveste orden scrolles ind.

| Klasse | Beskrivelse |
|---|---|
| `st-order-1` | Første — starter tidslinjen ved scroll |
| `st-order-2` | Starter når order-1 er færdig |
| `st-order-3` | Starter når order-2 er færdig |
| `st-order-4` | Starter når order-3 er færdig |
| `st-order-5` | Starter når order-4 er færdig |
| `st-order-6` | Starter når order-5 er færdig |

---

### 4. Distance — hvor langt bevæger det sig?

Standard: `st-dist-md`.

| Klasse | Afstand |
|---|---|
| `st-dist-sm` | 20px |
| `st-dist-md` | 40px |
| `st-dist-lg` | 80px |
| `st-dist-xl` | 120px |

---

### 5. Duration — hvor lang tid tager det?

Standard: `st-dur-600`.

| Klasse | Varighed |
|---|---|
| `st-dur-300` | 300ms — hurtig |
| `st-dur-600` | 600ms — normal |
| `st-dur-1000` | 1000ms — langsom |
| `st-dur-1600` | 1600ms — meget langsom |

---

### 6. Easing — hvordan bevæger det sig?

Standard: `st-ease-out`.

| Klasse | Følelse |
|---|---|
| `st-ease-linear` | Konstant hastighed |
| `st-ease-in` | Starter langsomt, accelererer |
| `st-ease-out` | Starter hurtigt, decelererer — naturlig |
| `st-ease-in-out` | Langsomt i begge ender |
| `st-ease-bounce` | Lille overshoot — legende |
| `st-ease-spring` | Elastisk overshoot — organisk |

---

### 7. Delay — skal det vente?

På et enkelt element: forsinkelse inden animationen starter.  
På et element med `st-order-*`: ekstra pause efter forrige element.

| Klasse | Forsinkelse |
|---|---|
| `st-delay-0` | 0ms |
| `st-delay-100` | 100ms |
| `st-delay-200` | 200ms |
| `st-delay-300` | 300ms |
| `st-delay-400` | 400ms |
| `st-delay-500` | 500ms |
| `st-delay-750` | 750ms |
| `st-delay-1000` | 1000ms |

---

### 8. Visibility threshold — hvornår trigges det?

Hvor meget af elementet der skal ses. Standard: `st-visible-50`.

| Klasse | Synlig andel |
|---|---|
| `st-visible-0` | 0% — trigger ved kanten |
| `st-visible-25` | 25% |
| `st-visible-50` | 50% |
| `st-visible-75` | 75% |

---

### 9. Parallax — bevæg i andet tempo end scroll

Kræver `st-scroll`. Virker i alle banner-miljøer.

| Klasse | Hastighed |
|---|---|
| `st-parallax-slow` | Langsommere end scroll — baggrundseffekt |
| `st-parallax-med` | Halvt tempo |
| `st-parallax-fast` | Hurtigere end scroll — forgrundseffekt |
| `st-parallax-reverse` | Modsat retning |

> På selvhostede sider (ikke iframe) kræver parallax et ekstra script-tag:
> ```html
> <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
> ```

---

## Eksempler

---

### Eksempel 1 — Minimum

```
class: st-fade-up
```

---

### Eksempel 2 — Med parametre

```
class: st-fade-up st-dist-lg st-dur-1000 st-ease-spring
```

---

### Eksempel 3 — Sekventiel animation

Elementer kører efter hinanden. Tidslinjen starter når order-1 ses.

```
Overskrift:      st-fade-up    st-dur-1000  st-ease-spring  st-order-1
Underoverskrift: st-fade-up    st-dur-600   st-ease-out     st-order-2
CTA-knap:        st-scale      st-dur-600   st-ease-spring  st-order-3  st-delay-200
```

Tidslinje:
```
0ms      Overskrift starter       (scroll trigger)
1000ms   Underoverskrift starter  (efter order-1 er færdig)
1800ms   CTA starter              (efter order-2 + 200ms ekstra pause)
```

---

### Eksempel 4 — Komplet banner-scene

```html
<!-- Head HTML — ~33 KB total -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/moire/ScrollTail@1.0/dist/scrolltail.min.js"></script>
```

| Element | class |
|---|---|
| Overskrift | `st-fade-up st-dist-lg st-dur-1000 st-ease-spring st-order-1` |
| Underoverskrift | `st-fade-up st-dist-md st-dur-600 st-ease-out st-order-2` |
| Fordel 1 | `st-fade-right st-dist-sm st-dur-300 st-ease-bounce st-order-3` |
| Fordel 2 | `st-fade-right st-dist-sm st-dur-300 st-ease-bounce st-order-4` |
| Fordel 3 | `st-fade-right st-dist-sm st-dur-300 st-ease-bounce st-order-5` |
| CTA-knap | `st-scale st-dur-600 st-ease-spring st-order-6 st-delay-200` |

ScrollTail bygger automatisk én GSAP timeline ud fra `st-order-*`.

---

### Eksempel 5 — Parallax baggrund

```html
<!-- Head HTML — ~61 KB med ScrollTrigger -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/moire/ScrollTail@1.0/dist/scrolltail.min.js"></script>
```

| Element | class |
|---|---|
| Baggrundsbillede | `st-scroll st-parallax-slow` |
| Overskrift | `st-fade-up st-dur-1000 st-ease-spring st-order-1` |
| CTA-knap | `st-scale st-dur-600 st-ease-spring st-order-2` |

---

### Eksempel 6 — Repeat

```
class: st-fade-up st-repeat st-dur-600 st-ease-out
```

---

## Quick-copy

```
Fade op:           st-fade-up
Fade op med stil:  st-fade-up st-dist-lg st-dur-1000 st-ease-spring
Slide ind:         st-slide-left st-dist-md st-dur-600 st-ease-bounce
Scale op:          st-scale st-dur-600 st-ease-spring
Med forsinkelse:   st-fade-up st-dur-600 st-delay-300
Repeat:            st-fade-up st-repeat
Parallax:          st-scroll st-parallax-slow

Sekvens:
  st-fade-up st-order-1
  st-fade-up st-order-2
  st-scale   st-order-3 st-delay-200
```
