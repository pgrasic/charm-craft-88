## Goal

Redesign the MedikApp frontend (medication reminder app for elderly users) following the chosen "Clinical Clarity" direction. Keep all current functionality and Croatian copy. Pure UI/UX work — no backend changes.

## Design tokens (locked from chosen direction)

Ported verbatim into `src/styles.css`:
- Navy palette: `#0f1b3d` (dark), `#1e3a5f` (mid), `#3b6fa0` (light), `#e8edf3` (background)
- Fonts: Sora (display, 700/800) for headings, Manrope (400/600/700) for body
- Base body size: 18px; headings 28–36px+
- Generous radii (xl/2xl/3xl), soft shadows, 4px focus rings
- Slow `slideIn` reveal animation (400ms, ease-out-expo)

Accessibility rules applied throughout:
- Min 56px tap targets on primary actions, 44px on secondary
- WCAG AA+ contrast (navy-dark on navy-bg, white on navy-mid)
- Icons paired with text labels (never icon-only)
- Visible 4px focus rings on all interactive elements
- No reliance on color alone for state

## Scope: routes and components

Assumption: this is the existing app's frontend in this Lovable project. I'll need to first read what's actually in `src/routes/` and existing components, then redesign them. If the project is currently the blank template (only placeholder index), I'll scaffold the screens shown in the user's screenshots.

### Screens to redesign

1. **Auth screens** (public, no sidebar)
   - `/login` (Prijava) — email, password with show toggle, primary "Prijava" button, "Novi ste ovdje? Registriraj se" link
   - `/register` (Registracija) — matching form style

2. **Authenticated shell** (sidebar layout)
   - Persistent left sidebar (`w-80`, navy-dark bg, white text)
     - MedikApp wordmark
     - Nav items: Moji podsjetnici, Dodaj podsjetnik (Unos lijeka), Korisnički račun
     - Active item: white/10 bg + 4px navy-light left border
     - Bottom: Odjava button (outlined)
     - Collapsible to icon-only via shadcn sidebar `collapsible="icon"`

3. **`/reminders` (Moji podsjetnici)** — primary screen
   - Header: "Danas • [day, date]" eyebrow + h1, right-side "Sljedeća doza: HH:MM" pill
   - Reminder cards: large priority card (white, 3xl radius, ring-4) + smaller upcoming/completed cards
   - Each priority card: pill icon block, medication name (3xl Sora), dose/interval, time block
   - Action grid: 2-col primary actions ("Označi kao uzeto" / "Odgodi") at h-20
   - Footer row of secondary actions: Uredi, Obriši, "Nemoj me podsjećati danas"

4. **`/add-reminder` (Unos lijeka)** — form screen
   - White card on navy-bg, same radius/shadow as reminder cards
   - Fields: medication search, start time, interval (hours), quantity
   - h-14 inputs with navy-bg fill, navy-mid focus border
   - Primary "Spremi podsjetnik" button h-16

5. **`/account` (Korisnički račun)**
   - Two cards side-by-side: "Vaši podaci" (ime, prezime, email + Spremi) and "Zahtjev za lijek" (naziv, djelatna tvar + Pošalji zahtjev)
   - Same input/button treatment as add-reminder form

## Implementation order

1. Read existing project files (`src/routes/`, `src/components/`, `src/styles.css`) to understand current state
2. Update `src/styles.css`: import Sora + Manrope, add navy color tokens, replace default semantic tokens (`--primary`, `--background`, etc.) so all shadcn components inherit the palette
3. Build `AppSidebar` component using shadcn sidebar primitives, styled per the direction
4. Build authenticated layout route (`_authenticated.tsx`) that wraps children in `SidebarProvider` + sidebar + main
5. Build/redesign each route file with the matching composition
6. Add a shared `ReminderCard` component for the priority + secondary variants
7. Verify in preview at desktop + tablet widths, check keyboard focus visibility

## Technical notes

- shadcn sidebar with `collapsible="icon"` so it shrinks rather than disappears
- TanStack Router route files (`src/routes/`), not `src/pages/`
- Use `var(--sidebar-width)` syntax (Tailwind 4 quirk)
- All semantic colors via `src/styles.css` tokens, no hex in components
- Animations: respect `prefers-reduced-motion` — wrap the reveal animation accordingly

## Out of scope

- Backend / data persistence (no Lovable Cloud changes)
- Auth wiring (forms are UI only unless already wired)
- Notifications/push reminders logic
- Mobile-app-specific patterns (this stays a responsive web app)
