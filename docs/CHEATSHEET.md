# ScrollTail — Designerguide

Tilføj scroll-animationer i Hype med klasser — ingen JavaScript.

---

## 1. Opsætning

Indsæt i `Document Inspector → Head HTML`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/intergraphicsDev/ScrollTail@1.0/dist/scrolltail.min.js"></script>
```

Sæt klasser på elementer via `Element Inspector → Additional HTML Attributes → class`.

---

## 2. Hurtig start — copy/paste direkte

```
Simpel fade:        st-fade-up
Fade med stil:      st-fade-up st-dur-1000 st-ease-spring
Slide ind:          st-slide-left st-dur-600 st-ease-bounce
Scale op:           st-scale st-dur-600 st-ease-spring
Blur ind:           st-blur st-dur-1000 st-ease-out
Med forsinkelse:    st-fade-up st-dur-600 st-delay-300
Repeat (frem/bag):  st-fade-up st-repeat
Scroll frem/tilbage: st-fade-up st-scroll

Sekvens (kører efter hinanden):
  Element 1 → st-fade-up st-dur-600 st-order-1
  Element 2 → st-fade-up st-dur-600 st-order-2
  Element 3 → st-scale   st-dur-600 st-order-3 st-delay-200
```

---

## 3. Alle klasser

### Animation — hvad sker der?
Vælg én. Elementet animerer automatisk når det scrolles ind.

| Klasse | Effekt |
|---|---|
| `st-fade` | Fade ind |
| `st-fade-up` | Fade ind nedefra |
| `st-fade-down` | Fade ind ovenfra |
| `st-fade-left` | Fade ind fra højre |
| `st-fade-right` | Fade ind fra venstre |
| `st-slide-left` | Slide ind fra højre — ingen fade |
| `st-slide-right` | Slide ind fra venstre — ingen fade |
| `st-scale` | Skaler ind fra 0 |
| `st-rotate` | Rotér ind fra -15deg |
| `st-blur` | Fade ind fra sløret til skarp |

### Duration — hvor lang tid?
Standard: `st-dur-600`

| Klasse | Tid |
|---|---|
| `st-dur-300` | 300ms — hurtig |
| `st-dur-600` | 600ms — normal |
| `st-dur-1000` | 1000ms — langsom |
| `st-dur-1600` | 1600ms — meget langsom |

### Easing — hvilken bevægelsesfornemmelse?
Standard: `st-ease-out`

| Klasse | Fornemmelse |
|---|---|
| `st-ease-linear` | Konstant |
| `st-ease-in` | Starter langsomt |
| `st-ease-out` | Decelererer — naturlig |
| `st-ease-in-out` | Blød i begge ender |
| `st-ease-bounce` | Lille overshoot — legende |
| `st-ease-spring` | Elastisk — organisk |

### Delay — vent inden start
Standard: ingen delay

| Klasse | Vent |
|---|---|
| `st-delay-100` | 100ms |
| `st-delay-200` | 200ms |
| `st-delay-300` | 300ms |
| `st-delay-500` | 500ms |
| `st-delay-750` | 750ms |
| `st-delay-1000` | 1000ms |

### Distance — hvor langt bevæger det sig?
Standard: `st-dist-md`

| Klasse | Afstand |
|---|---|
| `st-dist-sm` | 20px — subtil |
| `st-dist-md` | 40px |
| `st-dist-lg` | 80px |
| `st-dist-xl` | 120px — dramatisk |

### Scroll-adfærd
Tilføj kun hvis du vil noget andet end default.

| Klasse | Hvad sker der |
|---|---|
| *(ingen)* | Animerer én gang når elementet ses — **default** |
| `st-repeat` | Animerer igen ved hvert scroll ind og ud |
| `st-scroll` | Bundet til scroll — kører frem og baglæns |

### Rækkefølge — sekvens
Elementer med `st-order-*` kører automatisk efter hinanden.

| Klasse | Position |
|---|---|
| `st-order-1` | Starter tidslinjen |
| `st-order-2` | Starter når 1 er færdig |
| `st-order-3` | Starter når 2 er færdig |
| `st-order-4` | Starter når 3 er færdig |
| `st-order-5` | Starter når 4 er færdig |
| `st-order-6` | Starter når 5 er færdig |

**Timing-justeringer på ordnede elementer:**

| Klasse | Effekt |
|---|---|
| `st-delay-100` | Venter 100ms *efter* forrige er færdig |
| `st-delay-200` | Venter 200ms *efter* forrige er færdig |
| `st-delay-300` | Venter 300ms *efter* forrige er færdig |
| `st-delay-500` | Venter 500ms *efter* forrige er færdig |
| `st-overlap-100` | Starter 100ms *inden* forrige er færdig |
| `st-overlap-200` | Starter 200ms *inden* forrige er færdig |
| `st-overlap-300` | Starter 300ms *inden* forrige er færdig |
| `st-overlap-500` | Starter 500ms *inden* forrige er færdig |

> `st-delay-*` og `st-overlap-*` virker kun på elementer med `st-order-*`.

### Trigger — hvornår startes animationen?
Standard: 50% synligt. Tilføj kun hvis du vil ændre det.

| Klasse | Trigger når |
|---|---|
| `st-visible-0` | Kanten af elementet ses |
| `st-visible-25` | 25% er synligt |
| `st-visible-50` | 50% er synligt |
| `st-visible-75` | 75% er synligt |

### Parallax — bevæg i andet tempo
Kræver `st-scroll`. Virker i alle banner-miljøer.

| Klasse | Effekt |
|---|---|
| `st-parallax-slow` | Langsommere — baggrundseffekt |
| `st-parallax-med` | Halvt tempo |
| `st-parallax-fast` | Hurtigere — forgrundseffekt |
| `st-parallax-reverse` | Modsat retning |

---

## 4. Eksempler

### Simpel fade
```
class: st-fade-up
```

### Med parametre
```
class: st-fade-up st-dist-lg st-dur-1000 st-ease-spring
```

### Sekvens — elementer kører efter hinanden

| Element | class |
|---|---|
| Overskrift | `st-fade-up st-dur-1000 st-ease-spring st-order-1` |
| Underoverskrift | `st-fade-up st-dur-600 st-ease-out st-order-2` |
| Fordel 1 | `st-fade-right st-dur-300 st-ease-bounce st-order-3` |
| Fordel 2 | `st-fade-right st-dur-300 st-ease-bounce st-order-4` |
| Fordel 3 | `st-fade-right st-dur-300 st-ease-bounce st-order-5` |
| CTA-knap | `st-scale st-dur-600 st-ease-spring st-order-6 st-delay-200` |

Tidslinje: order-1 starter ved scroll → hvert element kører når det forrige er færdigt → CTA venter 200ms ekstra.

### Parallax + scroll-scene

```html
<!-- Tilføj ScrollTrigger til Head HTML for selvhostede sider -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

| Element | class |
|---|---|
| Baggrundsbillede | `st-scroll st-parallax-slow` |
| Overskrift | `st-scroll st-fade-up st-order-1` |
| CTA-knap | `st-scroll st-scale st-order-2` |

### Repeat — animerer frem og tilbage ved hvert scroll
```
class: st-fade-up st-repeat st-dur-600 st-ease-out
```
