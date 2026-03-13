# ScrollTail v2 — Designerguide

Tilføj scroll-animationer med klasser — ingen JavaScript.

---

## 1. Opsætning

Indsæt i `Document Inspector → Head HTML`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/intergraphicsDev/ScrollTail@2.0/dist/scrolltail.min.js"></script>
```

Sæt klasser på elementer via `Element Inspector → Additional HTML Attributes → class`.

---

## 2. Princip

Alle elementer kræver `st-scroll` for at aktivere ScrollTail.
Derefter tilføjes klasser alt efter effekt og adfærd.

```
st-scroll                         aktiverer scroll — alle defaults gælder
st-scroll st-fade                 fade frem og tilbage med scroll
st-scroll st-slide-up st-once     slide op, kører kun én gang
```

**Defaults** (gælder når intet andet er angivet):
- Animerer frem og tilbage med scroll
- Starter når elementet er 80% nede på skærmen
- Slutter når elementet er 20% fra toppen
- Bevæger sig 40px

---

## 3. Alle klasser

### Animation — hvad sker der visuelt?
Ingen animation = kun opacity.

| Klasse | Effekt |
|---|---|
| `st-fade` | Fade ind/ud |
| `st-slide-up` | Bevæger sig opad |
| `st-slide-down` | Bevæger sig nedad |
| `st-slide-left` | Bevæger sig til venstre |
| `st-slide-right` | Bevæger sig til højre |
| `st-parallax-up` | Subtil bevægelse opad uden fade |
| `st-parallax-down` | Subtil bevægelse nedad uden fade |
| `st-parallax-left` | Subtil bevægelse til venstre uden fade |
| `st-parallax-right` | Subtil bevægelse til højre uden fade |
| `st-scale` | Skalerer op fra 0 |
| `st-blur` | Unblur fra sløret til skarp |
| `st-rotate` | Roterer ind |

### Retning — fra, til eller igennem?

| Klasse | Hvad sker der |
|---|---|
| *(ingen)* | Fra udenfor ind til placering — **default** |
| `st-to` | Fra placering og ud |
| `st-from st-to` | Starter udenfor, passerer igennem og ud |

### Scroll-type — hvornår og hvor mange gange?

| Klasse | Adfærd |
|---|---|
| *(ingen)* | Scrub frem og tilbage — **default** |
| `st-once` | Kører én gang, forbliver synlig |
| `st-forward` | Kører frem, nulstiller ved scroll tilbage |
| `st-reverse` | Starter synlig, forsvinder ved scroll ned |

### Scrub-lag — blødere scroll-binding

| Klasse | Lag |
|---|---|
| *(ingen)* | Følger scroll 1:1 — **default** |
| `st-scrub-1` | 1 sek lag — blød |
| `st-scrub-2` | 2 sek lag — meget blød |

### Start — hvor på skærmen starter animationen?
Tallet = % fra toppen af viewport. Høj = lavt på skærmen.

| Klasse | Position |
|---|---|
| `st-start-100` | Rammer bunden — meget tidligt |
| `st-start-80` | 80% nede — **default** |
| `st-start-50` | Midt på skærmen |
| `st-start-20` | 20% fra toppen — sent |

### End — hvor på skærmen slutter animationen?

| Klasse | Position |
|---|---|
| `st-end-80` | 80% nede — kort distance |
| `st-end-50` | Midt på skærmen |
| `st-end-20` | 20% fra toppen — **default** |
| `st-end-0` | Toppen af viewport |

### Distance — hvor langt bevæger det sig?

| Klasse | Afstand |
|---|---|
| `st-dist-20` | 20px — subtil |
| `st-dist-40` | 40px — **default** |
| `st-dist-80` | 80px — markant |
| `st-dist-120` | 120px — dramatisk |

### Edge — animér til kanten af container

Elementet bevæger sig fra sin placering til X pixels fra containerens kant.
Kanten bestemmes af animationsretningen (`st-slide-down` → bund, `st-slide-up` → top osv.).

| Klasse | Afstand fra kant |
|---|---|
| `st-edge-0` | Flush mod kanten |
| `st-edge-5` | 5px fra kanten |
| `st-edge-10` | 10px fra kanten |
| `st-edge-20` | 20px fra kanten |

> `st-edge-*` erstatter `st-dist-*` og er altid en `to`-animation (fra placering og ud mod kanten).

### Pin — fastgør elementet mens du scroller

| Klasse | Effekt |
|---|---|
| `st-pin` | Elementet sidder fast mens resten scroller forbi |

Kombiner med `st-start-*` og `st-end-*` for at styre hvor længe det sidder fast.

### Duration — varighed (kun med `st-once`)

| Klasse | Tid |
|---|---|
| `st-dur-300` | 300ms — hurtig |
| `st-dur-600` | 600ms — **default** |
| `st-dur-1000` | 1000ms — langsom |
| `st-dur-1600` | 1600ms — meget langsom |

### Easing — bevægelsesfornemmelse (kun med `st-once`)

| Klasse | Fornemmelse |
|---|---|
| `st-ease-linear` | Konstant |
| `st-ease-in` | Starter langsomt |
| `st-ease-out` | Decelererer — **default** |
| `st-ease-in-out` | Blød i begge ender |
| `st-ease-bounce` | Lille overshoot — legende |
| `st-ease-spring` | Elastisk — organisk |

### Sekvens — elementer kører efter hinanden

| Klasse | Funktion |
|---|---|
| `st-order-1` → `st-order-6` | Definerer rækkefølgen |
| `st-delay-100` / `200` / `300` / `500` | Ekstra pause efter forrige |
| `st-overlap-100` / `200` / `300` / `500` | Starter inden forrige er færdig |

> Sekvens kræver `st-once` — bruges til tidsbaserede banner-animationer.

---

## 4. Eksempler

### Simpel scroll frem og tilbage
```
st-scroll st-fade
```

### Slide op, kun én gang
```
st-scroll st-slide-up st-once st-dur-600 st-ease-out
```

### Element der glider ind og ud igen
```
st-scroll st-slide-up st-from st-to st-dist-80
```

### Parallax-lignende bevægelse
```
st-scroll st-slide-down st-to st-dist-120 st-scrub-1 st-start-100 st-end-0
```
Elementet bevæger sig langsomt nedad mens siden scroller.

### Overskrift der sidder fast
```
st-scroll st-pin st-start-50 st-end-20
```

### Sekvens — banner med intro-animation

| Element | class |
|---|---|
| Logo | `st-scroll st-fade st-once st-order-1` |
| Overskrift | `st-scroll st-slide-up st-once st-dur-1000 st-ease-spring st-order-2` |
| Underoverskrift | `st-scroll st-fade st-once st-dur-600 st-order-3 st-overlap-200` |
| CTA-knap | `st-scroll st-scale st-once st-dur-600 st-ease-spring st-order-4 st-delay-200` |

### Edge — dock til kant
```
Scroller ned til 5px fra bunden:
  st-scroll st-slide-down st-edge-5

Scroller op til 10px fra toppen:
  st-scroll st-slide-up st-edge-10

Slide ind fra højre og lander flush:
  st-scroll st-slide-right st-edge-0 st-once
```

### Hurtig reference
```
Fade frem/tilbage:           st-scroll st-fade
Slide op én gang:            st-scroll st-slide-up st-once
Passerer igennem:            st-scroll st-slide-up st-from st-to
Blød scroll-binding:         st-scroll st-slide-up st-scrub-1
Custom trigger/end:          st-scroll st-fade st-start-50 st-end-0
Pin:                         st-scroll st-pin st-start-50 st-end-20
Dock til bund:               st-scroll st-slide-down st-edge-5
```
