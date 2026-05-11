# Pulse — Design System
**Event Hosting Platform · Tech Hub Edition**

> A dark-first, high-contrast design language built for young builders in a high-energy onsite environment. Every decision prioritises clarity at a glance, spatial breathing room, and a sharp aesthetic that respects the intelligence of its users.

---

## 1. Design Principles

| Principle | Expression |
|---|---|
| **Clarity over decoration** | Information is always legible. Visual flair never competes with utility. |
| **Dark-native** | Designed from the ground up for dark environments — not an afterthought inversion. |
| **High signal, low noise** | Colour is semantic. A teal glow means something. A rose pulse means something else. |
| **Spatial generosity** | Generous padding. Let elements breathe. Density is earned, not default. |
| **Motion with intent** | Animations confirm state changes; they don't perform. Every transition has a reason. |

---

## 2. Color System

### Foundations

The palette is anchored by deep navy-blacks. A single electric primary and a warm alert accent carry all semantic meaning. Everything else is neutral.

```css
:root {
  /* Backgrounds */
  --color-bg:              #080B11;   /* App shell, page background */
  --color-surface:         #0F1219;   /* Cards, panels */
  --color-surface-raised:  #171B25;   /* Dropdowns, popovers */
  --color-surface-overlay: #1F2433;   /* Modals, sheets */

  /* Borders */
  --color-border:          #252A38;   /* Default border */
  --color-border-subtle:   #1C2030;   /* Dividers, very subtle separation */
  --color-border-focus:    #00E5B4;   /* Focus rings */

  /* Brand — Electric Mint */
  --color-primary:         #00E5B4;
  --color-primary-hover:   #00FFD0;
  --color-primary-muted:   #00E5B41A; /* 10% alpha — glows, highlights */
  --color-primary-dim:     #00E5B433; /* 20% alpha — active backgrounds */

  /* Accent — Vivid Rose */
  --color-accent:          #FF4D6D;
  --color-accent-hover:    #FF6B85;
  --color-accent-muted:    #FF4D6D1A;

  /* Semantic */
  --color-success:         #22D98A;
  --color-success-muted:   #22D98A1A;
  --color-warning:         #F5A623;
  --color-warning-muted:   #F5A6231A;
  --color-error:           #FF4D6D;   /* Shared with accent */
  --color-info:            #4D9FFF;
  --color-info-muted:      #4D9FFF1A;

  /* Text */
  --color-text-primary:    #F0F2F8;   /* Headings, primary labels */
  --color-text-secondary:  #8A90A8;   /* Supporting copy, metadata */
  --color-text-muted:      #4A5068;   /* Placeholders, disabled */
  --color-text-on-primary: #080B11;   /* Text placed on primary-filled backgrounds */
}
```

### Semantic Colour Usage

| Token | Use Cases |
|---|---|
| `--color-primary` | CTAs, active states, links, focus rings, live indicators |
| `--color-accent` | Alerts, live/urgent badges, destructive actions, error states |
| `--color-success` | Confirmation toasts, verified badges, completed attendance |
| `--color-warning` | Draft states, expiring events, caution banners |
| `--color-info` | Informational tooltips, passive notifications |
| `--color-text-secondary` | Timestamps, usernames in lists, helper text |
| `--color-text-muted` | Input placeholders, disabled labels |

### Colour Pairings — Do / Don't

```
✅  --color-primary on --color-bg          (contrast ≥ 7:1)
✅  --color-text-primary on --color-surface
✅  --color-text-on-primary on --color-primary (filled buttons)
✅  --color-accent on --color-surface-raised

❌  --color-text-muted on --color-bg       (fails WCAG AA)
❌  --color-primary on --color-surface-raised (marginal — add bg dim instead)
❌  Two saturated colours as adjacent foregrounds
```

---

## 3. Typography

### Font Stack

| Role | Family | Weight Range | Usage |
|---|---|---|---|
| **Display** | Syne | 700, 800 | Hero headings, event titles, large numerics |
| **Body** | DM Sans | 400, 500, 600 | All UI text, paragraphs, labels |
| **Mono** | JetBrains Mono | 400, 500 | IDs, tokens, QR reference codes, code blocks |

```css
:root {
  --font-display: 'Syne', sans-serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}
```

### Type Scale

```css
:root {
  /* Display */
  --text-display-2xl: clamp(3rem, 6vw, 5rem);    /* 48–80px  Hero */
  --text-display-xl:  clamp(2.25rem, 4vw, 3.5rem); /* 36–56px  Section hero */
  --text-display-lg:  clamp(1.75rem, 3vw, 2.5rem); /* 28–40px  Page title */

  /* Headings */
  --text-h1:  2rem;      /* 32px */
  --text-h2:  1.5rem;    /* 24px */
  --text-h3:  1.25rem;   /* 20px */
  --text-h4:  1.125rem;  /* 18px */

  /* Body */
  --text-lg:  1.125rem;  /* 18px — lead paragraphs */
  --text-md:  1rem;      /* 16px — default body */
  --text-sm:  0.875rem;  /* 14px — metadata, captions */
  --text-xs:  0.75rem;   /* 12px — badges, timestamps */

  /* Mono */
  --text-mono-sm: 0.8125rem; /* 13px */
  --text-mono-xs: 0.6875rem; /* 11px */
}
```

### Line Heights & Letter Spacing

```css
:root {
  --leading-tight:   1.2;   /* Display, headings */
  --leading-snug:    1.4;   /* Sub-headings */
  --leading-normal:  1.6;   /* Body copy */
  --leading-relaxed: 1.75;  /* Long-form text */

  --tracking-tighter: -0.03em;  /* Large display text */
  --tracking-tight:   -0.01em;  /* Headings */
  --tracking-normal:   0em;
  --tracking-wide:     0.06em;  /* Uppercase labels, badges */
  --tracking-widest:   0.12em;  /* Section eyebrows */
}
```

### Typography Patterns

```
EVENT CARD TITLE
  font: Syne 700, --text-h3
  color: --color-text-primary
  letter-spacing: --tracking-tight

METADATA (date, location, member count)
  font: DM Sans 400, --text-sm
  color: --color-text-secondary

SECTION EYEBROW (e.g. "UPCOMING · 4 EVENTS")
  font: DM Sans 600, --text-xs
  color: --color-primary
  letter-spacing: --tracking-widest
  text-transform: uppercase

QR TOKEN DISPLAY
  font: JetBrains Mono 500, --text-mono-sm
  color: --color-text-secondary
  background: --color-surface-raised
```

---

## 4. Spacing

A base-8 scale. All spacing decisions snap to multiples of 4px or 8px.

```css
:root {
  --space-1:   0.25rem;   /*  4px */
  --space-2:   0.5rem;    /*  8px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */
}
```

### Spacing Guidelines

| Context | Token |
|---|---|
| Inside tight components (badge padding, icon gap) | `--space-1` to `--space-2` |
| Card internal padding | `--space-6` |
| Section vertical rhythm | `--space-12` to `--space-16` |
| Page-level horizontal gutters | `--space-8` (mobile) / `--space-12` (desktop) |
| Between stacked cards in a list | `--space-4` |

---

## 5. Grid & Layout

```css
:root {
  --grid-columns:     12;
  --grid-gutter:      1.5rem;   /* 24px */
  --grid-max-width:   1280px;
  --grid-page-margin: clamp(1rem, 5vw, 3rem);

  /* Common layout widths */
  --width-narrow:   640px;   /* Forms, modals, focused content */
  --width-content:  800px;   /* Article-style layouts */
  --width-default:  1024px;  /* Standard pages */
  --width-wide:     1280px;  /* Dashboard, full-width tables */
}
```

### Layout Regions

```
┌─────────────────────────────────────────────┐
│  SIDEBAR  │           MAIN CONTENT          │
│  240px    │                                 │
│           │   ┌───────────────────────┐     │
│  Nav      │   │  PAGE HEADER          │     │
│  Links    │   │  Title + actions      │     │
│  Profile  │   ├───────────────────────┤     │
│           │   │  CONTENT AREA         │     │
│           │   │  Cards / Tables       │     │
│           │   └───────────────────────┘     │
└─────────────────────────────────────────────┘
```

- Sidebar collapses to a bottom tab bar on narrow viewports (PWA mobile)
- Content area max-width: `--width-wide` with auto horizontal margins
- No centred single-column layouts on desktop — use the full grid

---

## 6. Border Radius

```css
:root {
  --radius-sm:   4px;    /* Badges, tags, small chips */
  --radius-md:   8px;    /* Inputs, buttons */
  --radius-lg:   12px;   /* Cards */
  --radius-xl:   16px;   /* Modals, large panels */
  --radius-2xl:  24px;   /* Feature cards, hero panels */
  --radius-full: 9999px; /* Avatars, pills, toggle switches */
}
```

**Rule:** Nesting radius — inner radius = outer radius − padding distance. A card at `--radius-lg` (12px) with 16px padding gets inner elements at `max(0px, 12px - 16px)` = 0px flat, or use `--radius-sm` for subtle inner definition.

---

## 7. Shadows & Elevation

Shadows use colour tinting rather than pure black, which feels more natural on dark surfaces.

```css
:root {
  /* Ambient — barely lifted */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.4);

  /* Cards, default panels */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.5),
               0 0 0 1px rgba(255,255,255,0.04);

  /* Raised panels, dropdowns */
  --shadow-md: 0 4px 16px rgba(0,0,0,0.6),
               0 0 0 1px rgba(255,255,255,0.06);

  /* Modals, high-intent overlays */
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.7),
               0 0 0 1px rgba(255,255,255,0.08);

  /* Primary glow — active states, focused CTAs */
  --shadow-glow-primary: 0 0 20px rgba(0,229,180,0.25),
                         0 0 40px rgba(0,229,180,0.10);

  /* Accent glow — alerts, live badges */
  --shadow-glow-accent:  0 0 16px rgba(255,77,109,0.30);
}
```

### Elevation Stack

| Level | Token | Used On |
|---|---|---|
| 0 | Background | Page canvas |
| 1 | `--shadow-sm` | Cards, list items |
| 2 | `--shadow-md` | Sticky headers, dropdowns |
| 3 | `--shadow-lg` | Modals, command palette |
| Glow | `--shadow-glow-primary` | Active CTAs, selected cards |

---

## 8. Iconography

**Library:** [Lucide](https://lucide.dev) — stroke-based, consistent weight, tree-shakeable.

```
Stroke width:  1.5px (default)  ·  2px (small sizes ≤ 16px)
Size scale:    12 · 16 · 20 · 24 · 32 · 48px
Colour:        inherit from text token — never hardcoded
```

### Icon + Label Pairing

```
gap: --space-2 (8px) for inline icon + text
gap: --space-3 (12px) for stacked icon + label (e.g. nav items)

Never scale icons with font-size — use explicit pixel sizes.
```

### Semantic Icon Mapping

| Icon | Meaning |
|---|---|
| `QrCode` | Scan / verify identity |
| `CalendarDays` | Event date |
| `Users` | Attendees / member list |
| `Lock` | Private event |
| `Globe` | Open event |
| `CheckCircle2` | Attendance confirmed |
| `ShieldCheck` | Organizer / verified role |
| `Plus` | Create action |
| `ScanLine` | Active scanning mode |
| `Bell` | Notification |

---

## 9. Motion & Animation

All animations respect `prefers-reduced-motion`.

```css
:root {
  /* Durations */
  --duration-instant:  80ms;
  --duration-fast:     150ms;
  --duration-normal:   250ms;
  --duration-slow:     400ms;
  --duration-enter:    350ms;
  --duration-exit:     200ms;  /* Exits always faster than entrances */

  /* Easings */
  --ease-default:  cubic-bezier(0.16, 1, 0.3, 1);   /* Snappy, overshoots slightly */
  --ease-in:       cubic-bezier(0.4, 0, 1, 1);
  --ease-out:      cubic-bezier(0, 0, 0.2, 1);
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy — use sparingly */
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration:   0.01ms !important;
    transition-duration:  0.01ms !important;
  }
}
```

### Animation Patterns

**Page entry** — stagger child elements 40ms apart, fade + translate Y(8px) → Y(0)

**Card hover** — `translateY(-2px)` + `--shadow-glow-primary`, duration `--duration-fast`

**Button press** — `scale(0.97)`, duration `--duration-instant`, ease-in

**Toast/notification enter** — slide in from bottom-right + fade, `--duration-enter`

**QR scan confirmation** — primary glow pulse `0 → 1 → 0` opacity, 600ms, 2 iterations

**Badge "live" indicator** — scale pulse `1 → 1.4 → 1`, infinite, 2s, `--ease-spring`

---

## 10. Components

### Button

```
Variants:   primary | secondary | ghost | danger
Sizes:      sm | md | lg
States:     default | hover | active | focus | disabled | loading

Primary
  bg:              --color-primary
  color:           --color-text-on-primary
  font:            DM Sans 600, --text-sm
  letter-spacing:  --tracking-wide
  padding:         --space-3 --space-6
  radius:          --radius-md
  hover → bg:      --color-primary-hover + --shadow-glow-primary
  active → scale:  0.97

Secondary
  bg:              transparent
  border:          1px solid --color-border
  color:           --color-text-primary
  hover → border:  --color-primary
  hover → color:   --color-primary

Ghost
  bg:              transparent
  color:           --color-text-secondary
  hover → bg:      --color-surface-raised
  hover → color:   --color-text-primary

Danger
  bg:              --color-accent-muted
  border:          1px solid --color-accent
  color:           --color-accent
  hover → bg:      --color-accent
  hover → color:   --color-text-on-primary

Loading state
  Replace label with spinner (20px Lucide Loader2, spin animation)
  pointer-events: none; opacity: 0.7
```

---

### Input / Form Field

```
Structure:
  [Label]
  [Input / Textarea / Select]
  [Helper text or Error message]

Default
  bg:          --color-surface
  border:      1px solid --color-border
  color:       --color-text-primary
  radius:      --radius-md
  padding:     --space-3 --space-4
  font:        DM Sans 400, --text-md

Focus
  border:      1px solid --color-primary
  box-shadow:  0 0 0 3px --color-primary-dim

Error
  border:      1px solid --color-accent
  box-shadow:  0 0 0 3px --color-accent-muted
  helper text: --color-accent, --text-xs

Disabled
  bg:          --color-surface-raised
  color:       --color-text-muted
  cursor:      not-allowed

Label
  font:        DM Sans 500, --text-sm
  color:       --color-text-secondary
  margin-bottom: --space-2

Helper text
  font:        DM Sans 400, --text-xs
  color:       --color-text-muted
  margin-top:  --space-1
```

---

### Card

```
Default card
  bg:      --color-surface
  border:  1px solid --color-border
  radius:  --radius-lg
  shadow:  --shadow-sm
  padding: --space-6

Hoverable card (event cards, member rows)
  transition: transform --duration-fast, box-shadow --duration-fast
  hover → transform:   translateY(-2px)
  hover → shadow:      --shadow-glow-primary
  hover → border:      --color-primary (20% alpha)

Selected / active card
  border:     1px solid --color-primary
  bg:         --color-primary-dim
  shadow:     --shadow-glow-primary

Card anatomy
  ┌──────────────────────────────┐
  │  [Event badge]   [Status]   │  ← card header: flex space-between
  │                             │
  │  Event Name                 │  ← --text-h3, Syne 700
  │  Short description          │  ← --text-sm, secondary
  │                             │
  │  ──────────────────────     │  ← --color-border-subtle divider
  │                             │
  │  📅 Nov 12  👥 42  📍Hall B  │  ← metadata row, --text-xs
  └──────────────────────────────┘
```

---

### Badge / Tag

```
Sizes:   sm (--text-xs) | md (--text-sm)
Radius:  --radius-sm (rectangular) | --radius-full (pill)

Status badges
  published:  bg --color-success-muted,  color --color-success,  border --color-success (30% alpha)
  draft:      bg --color-warning-muted,  color --color-warning,  border --color-warning (30% alpha)
  live:       bg --color-accent-muted,   color --color-accent,   border --color-accent (30% alpha)
              + animated pulse dot (8px circle, --color-accent, infinite scale pulse)
  open:       bg --color-info-muted,     color --color-info
  private:    bg --color-surface-raised, color --color-text-secondary, icon: Lock 12px

Role badges
  creator:    bg --color-primary-dim,    color --color-primary
  organizer:  bg --color-info-muted,     color --color-info
  attendee:   bg --color-surface-raised, color --color-text-secondary

Typography: DM Sans 600, --tracking-wide, uppercase
Padding:    --space-1 --space-3 (sm) · --space-2 --space-3 (md)
```

---

### Avatar

```
Sizes: xs(24) · sm(32) · md(40) · lg(56) · xl(80)px
Shape: --radius-full

Fallback (no photo):
  bg:     derived from username hash → one of 6 muted palette colours
  text:   initials, DM Sans 600, --color-text-on-primary equivalent
  Never use a grey generic silhouette

Online indicator:
  8px circle, --color-success, --shadow-xs
  position: absolute bottom-0 right-0
  border: 2px solid --color-bg (creates the gap effect)

Avatar group (stacked):
  overlap: -8px margin-left per item after first
  max display: 4 avatars + "+N" overflow pill
  overflow pill: same size, --color-surface-raised, --color-text-secondary
```

---

### Modal / Sheet

```
Overlay:   rgba(0,0,0,0.75) backdrop-blur(4px)
Panel:     bg --color-surface-overlay, border --color-border, --shadow-lg
Radius:    --radius-xl (modal) | radius top-only --radius-xl (bottom sheet)
Width:     --width-narrow (default) | --width-content (wide variant)
Padding:   --space-8

Header
  Title:   Syne 700, --text-h2
  Close:   Ghost icon button, top-right

Enter animation:  scale(0.95) + opacity(0) → scale(1) + opacity(1), --duration-enter
Exit animation:   opacity(1) → opacity(0), --duration-exit
```

---

### QR Scanner View

```
This is a full-screen takeover used by organizers.

bg:          #000 (true black for camera context)
Viewfinder:
  size:      min(320px, 80vw) square
  border:    2px solid --color-primary
  radius:    --radius-lg
  corners:   decorative corner brackets in --color-primary (not a full border — just L-shapes)
  glow:      --shadow-glow-primary

Scan line:  1px solid --color-primary, 30% opacity
            animates top → bottom, 2s infinite, ease-in-out

On success:
  Viewfinder border flashes --color-success
  User card slides up from bottom (bottom sheet pattern)
  Confirmation check animation: scale 0 → 1.2 → 1, --color-success

On failure (not registered):
  Viewfinder border flashes --color-accent
  Toast: "Not registered for this event"
```

---

### Toast / Notification

```
Position:  bottom-right, --space-6 from edges
Width:     360px
Stack:     up to 3 visible, older ones scale down and fade

Anatomy:
  ┌────────────────────────────────────┐
  │ [Icon]  Message text       [✕]    │
  └────────────────────────────────────┘

Types
  success: left border 4px --color-success + icon CheckCircle2
  error:   left border 4px --color-accent  + icon AlertCircle
  info:    left border 4px --color-info    + icon Info
  warning: left border 4px --color-warning + icon AlertTriangle

bg:      --color-surface-overlay
shadow:  --shadow-lg
radius:  --radius-md
padding: --space-4 --space-5
font:    DM Sans 400, --text-sm

Auto-dismiss: 4s (success/info) · persistent (error)
```

---

## 11. Tailwind Configuration

```js
// tailwind.config.ts
import { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:             '#080B11',
        surface:        '#0F1219',
        'surface-r':    '#171B25',
        'surface-o':    '#1F2433',
        border:         '#252A38',
        'border-s':     '#1C2030',
        primary:        '#00E5B4',
        'primary-h':    '#00FFD0',
        accent:         '#FF4D6D',
        success:        '#22D98A',
        warning:        '#F5A623',
        info:           '#4D9FFF',
        'text-1':       '#F0F2F8',
        'text-2':       '#8A90A8',
        'text-3':       '#4A5068',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'24px',
      },
      boxShadow: {
        sm:   '0 2px 8px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04)',
        md:   '0 4px 16px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.06)',
        lg:   '0 8px 32px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.08)',
        glow: '0 0 20px rgba(0,229,180,.25), 0 0 40px rgba(0,229,180,.10)',
        'glow-accent': '0 0 16px rgba(255,77,109,.30)',
      },
      transitionDuration: {
        instant: '80ms',
        fast:    '150ms',
        normal:  '250ms',
        slow:    '400ms',
      },
      transitionTimingFunction: {
        default: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## 12. Accessibility

- **Contrast targets:** All text against its background meets WCAG AA (4.5:1 body, 3:1 large text). Primary `#00E5B4` on `#080B11` achieves ~9.5:1.
- **Focus management:** Every interactive element has a visible focus ring using `--color-border-focus`. Never use `outline: none` without a custom replacement.
- **Keyboard navigation:** Modal opens trap focus. QR scanner view provides a keyboard-accessible close path.
- **Touch targets:** Minimum 44×44px for all interactive elements (PWA mobile requirement).
- **Reduced motion:** All non-essential animations disabled via `prefers-reduced-motion: reduce`.
- **Semantic HTML:** Use `<button>` for actions, `<a>` for navigation, ARIA roles on custom components.

---

## 13. Font Loading

```html
<!-- In <head> — preconnect first, then load display + body + mono -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

> Since this runs on a private network, consider self-hosting fonts via `@font-face` to avoid any external dependency. Download from Google Fonts and serve from `/public/fonts/`.
