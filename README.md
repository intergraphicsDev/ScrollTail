# ScrollTail

Class-based scroll animation library for HTML5 banners — powered by GSAP.

**ScrollTail lytter på scroll. GSAP animerer. Hype håndterer alt andet.**

- < 2 KB gzipped
- Virker i alle banner-miljøer: Google Campaign Manager, Adform, Bannersnack, selvhostede sider
- Ingen JavaScript per banner — kun klasser på elementer
- Sekventiel animation via GSAP timeline
- Scroll-scrub via IntersectionObserver ratio (virker i iframes uden publisher-setup)

---

## Kom i gang

Tilføj i `<head>`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/moire/ScrollTail@1.0/dist/scrolltail.min.js"></script>
```

Sæt klasser på elementer:

```html
<div class="st-fade-up">Simpel fade</div>
<div class="st-fade-up st-dur-1000 st-ease-spring st-delay-200">Med parametre</div>
<div class="st-slide-left st-scroll">Scroll-scrub frem og tilbage</div>
```

---

## Klasser

### Animationstype

| Klasse | Beskrivelse |
|---|---|
| `st-fade` | Fade ind |
| `st-fade-up` | Fade ind nedefra |
| `st-fade-down` | Fade ind ovenfra |
| `st-fade-left` | Fade ind fra højre |
| `st-fade-right` | Fade ind fra venstre |
| `st-slide-left` | Slide ind fra højre |
| `st-slide-right` | Slide ind fra venstre |
| `st-scale` | Skaler ind fra 0 |
| `st-rotate` | Rotér ind fra -15deg |
| `st-blur` | Fade ind fra sløret |

### Scroll-adfærd

| Klasse | Adfærd |
|---|---|
| *(ingen)* | Trigger én gang — default |
| `st-repeat` | Trigger igen ved hvert scroll ind/ud |
| `st-scroll` | Bind til scroll-position (frem og tilbage) |

### Rækkefølge

```html
<div class="st-fade-up st-order-1">Første</div>
<div class="st-fade-up st-order-2">Anden</div>
<div class="st-scale   st-order-3 st-delay-200">Tredje + 200ms pause</div>
```

### Parametre

| Kategori | Klasser |
|---|---|
| Distance | `st-dist-sm` `st-dist-md` `st-dist-lg` `st-dist-xl` |
| Duration | `st-dur-300` `st-dur-600` `st-dur-1000` `st-dur-1600` |
| Delay | `st-delay-100` `st-delay-200` `st-delay-300` `st-delay-500` `st-delay-750` `st-delay-1000` |
| Easing | `st-ease-linear` `st-ease-in` `st-ease-out` `st-ease-in-out` `st-ease-bounce` `st-ease-spring` |
| Threshold | `st-visible-0` `st-visible-25` `st-visible-50` `st-visible-75` |
| Parallax | `st-parallax-slow` `st-parallax-med` `st-parallax-fast` `st-parallax-reverse` |

---

## Brug i Tumult Hype

1. `Document Inspector → Head HTML` — indsæt script-tags
2. Vælg element → `Element Inspector → Additional HTML Attributes → class`
3. Skriv klasser, f.eks.: `st-fade-up st-dur-1000 st-ease-spring`

---

## JavaScript API

```javascript
ScrollTail.refresh();   // Genscanner DOM
ScrollTail.pause();     // Pauser alle animationer
ScrollTail.resume();    // Genaktiverer
ScrollTail.destroy();   // Rydder alt — brug ved Hype scene-cleanup
```

---

## Eksempler

Se mappen [`examples/`](examples/) for tre færdige banner-demoer.

---

## Licens

MIT — frit at bruge i kommercielle bannere.  
GSAP er underlagt [GSAP's egen licens](https://gsap.com/licensing/).
