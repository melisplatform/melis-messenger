import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Topbar messenger widget — the chat icon shown next to the language switcher, present ONLY when
 * the MelisMessenger module is active (registered as the brick's `Header`).
 *
 *  - Shows an unread-count badge, polled from the legacy endpoint getNewMessage.
 *  - On click, opens the user profile ("My account") and activates the Messenger tab that the
 *    module adds dynamically to the profile — reusing the legacy tool (in the profile iframe).
 *
 * Inline styles only (the host Tailwind build doesn't scan the brick; lucide isn't a host global).
 */
const ACCOUNT_ROUTE = '/melis-core/account' // host route for the user profile (zone-pool iframe)
const PROFILE_FRAME_TITLE = 'meliscore_user_profile' // ZoneFrames sets iframe title = melisKey
const MESSENGER_TAB_HREF = '#id_melismessenger_tool' // the dynamically-added Messenger tab link
const NEW_MESSAGES_URL = '/melis/MelisMessenger/MelisMessenger/getNewMessage'
const POLL_MS = 60_000

async function fetchNewCount(): Promise<number> {
  try {
    const res = await fetch(NEW_MESSAGES_URL, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include',
    })
    if (!res.ok) return 0
    const data = (await res.json()) as { messages?: unknown[] }
    return Array.isArray(data.messages) ? data.messages.length : 0
  } catch {
    return 0
  }
}

const MESSENGER_PANE_ID = MESSENGER_TAB_HREF.slice(1) // 'id_melismessenger_tool'

/**
 * After the profile iframe is up, switch it to the Messenger tab — EXCLUSIVELY. We don't just click
 * the tab link: the profile finishes loading async and activates its default (first) tab, racing
 * with us and leaving BOTH panes active (stacked). So we drive the iframe DOM directly: clear every
 * pane/nav-item in the group, then set the Messenger pane/link active — and re-apply for a short
 * window to win the race against the profile's late auto-activation. One click() triggers the
 * legacy lazy content-load. After the window we stop, so the user can switch tabs freely.
 */
function activateMessengerTab() {
  let tries = 0
  let streak = 0
  const iv = window.setInterval(() => {
    tries++
    const frame = document.querySelector(`iframe[title="${PROFILE_FRAME_TITLE}"]`) as HTMLIFrameElement | null
    let win: (Window & { messengerTool?: { openMessengerTab?: () => void } }) | null = null
    let doc: Document | null = null
    try { win = (frame?.contentWindow as never) ?? null; doc = frame?.contentDocument ?? null } catch { win = null; doc = null }
    const tc = doc?.querySelector('.user-profile-tab-content .tab-content') as HTMLElement | null
    const link = doc?.querySelector(`a[href="${MESSENGER_TAB_HREF}"]`) as HTMLElement | null
    const pane = doc?.getElementById(MESSENGER_PANE_ID)
    // Tabs not rendered yet — wait (the profile root can be visible before its tab widget loads,
    // which is why an early single call missed; keep polling until the tab + pane exist).
    if (!tc || !link || !pane) { if (tries > 60) window.clearInterval(iv); return }

    const others = Array.from(tc.children).filter(
      (c) => c.classList.contains('tab-pane') && c.id !== MESSENGER_PANE_ID && c.classList.contains('active'),
    )
    if (pane.classList.contains('active') && others.length === 0) {
      // Messenger tab is exclusively active. Hold a few ticks (to beat the profile's late
      // auto-activation), then stop so the user can switch tabs freely.
      if (++streak > 4) window.clearInterval(iv)
      return
    }
    streak = 0
    // Not (yet) on Messenger — assert it. Prefer the module's own flow (switches tab + lazy-loads
    // content, like the legacy header icon); fall back to a direct DOM switch if the fn isn't there.
    if (win?.messengerTool?.openMessengerTab) {
      try { win.messengerTool.openMessengerTab() } catch { /* retry next tick */ }
    } else {
      tc.querySelectorAll(':scope > .tab-pane').forEach((p) => p.classList.remove('active', 'show'))
      pane.classList.add('active', 'show')
      const li = link.closest('li')
      li?.parentElement?.querySelectorAll('li, a').forEach((e) => e.classList.remove('active'))
      link.classList.add('active')
      li?.classList.add('active')
    }
    if (tries > 60) window.clearInterval(iv) // give up after ~18s
  }, 300)
}

/**
 * Ensure the messenger contact UI is usable. The tab's init (initTokenizePlugin + getContactList,
 * the `#selectUsers` user picker that the "+" button needs) is gated on the async user-rights call
 * (getUserRights); buildToolPage runs the zone jscallback ONCE at load, often BEFORE the rights
 * come back, so the tokenize2 picker never initialises and "+" stays inert. Re-run loadContact
 * (a no-op until rights are in) until the picker is up. Idempotent: we stop as soon as tokenize2
 * has wrapped the select (a `.tokenize` widget appears).
 */
function ensureMessengerReady() {
  let tries = 0
  const iv = window.setInterval(() => {
    tries++
    const frame = document.querySelector(`iframe[title="${PROFILE_FRAME_TITLE}"]`) as HTMLIFrameElement | null
    let win: (Window & { messengerTool?: { loadContact?: () => void } }) | null = null
    let doc: Document | null = null
    try { win = (frame?.contentWindow as never) ?? null; doc = frame?.contentDocument ?? null } catch { win = null; doc = null }
    const select = doc?.getElementById('selectUsers')
    if (!doc || !select) { if (tries > 60) window.clearInterval(iv); return }
    const ready = !!doc.querySelector('.select-contacts .tokenize') || getComputedStyle(select).display === 'none'
    if (ready) { window.clearInterval(iv); return } // picker initialised → "+" works
    try { win?.messengerTool?.loadContact?.() } catch { /* retry next tick */ }
    if (tries > 60) window.clearInterval(iv) // give up after ~30s
  }, 500)
}

export default function MessengerHeader() {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    let active = true
    const tick = () => { fetchNewCount().then((n) => { if (active) setCount(n) }) }
    tick()
    const iv = window.setInterval(tick, POLL_MS)
    return () => { active = false; window.clearInterval(iv) }
  }, [])

  function open() {
    const w = window as unknown as {
      __melisOpenAccount?: () => void
      __melisOpenTab?: (t: { id: string; label: string; path: string }) => void
      __melisAccountActiveTab?: string
    }
    // « Mon compte » est désormais NATIF (React) et l'onglet Messenger est natif aussi : on
    // présélectionne l'onglet via un global + un événement (AccountPage les lit), au lieu de piloter
    // l'iframe legacy. (activateMessengerTab/ensureMessengerReady ne servent plus que pour la vue « Old ».)
    w.__melisAccountActiveTab = 'messenger'
    window.dispatchEvent(new CustomEvent('melis-account-open-tab', { detail: 'messenger' }))
    // Prefer the host opener so the tab gets the profile's own (translated) label "Mon compte".
    if (typeof w.__melisOpenAccount === 'function') {
      w.__melisOpenAccount()
    } else {
      w.__melisOpenTab?.({ id: ACCOUNT_ROUTE, label: 'Mon compte', path: ACCOUNT_ROUTE })
      navigate(ACCOUNT_ROUTE)
    }
    // Refresh the badge shortly after opening (messages get marked read in the tool).
    window.setTimeout(() => { fetchNewCount().then(setCount) }, 4000)
  }

  return (
    <button
      type="button"
      aria-label="Messenger"
      title="Messenger"
      onClick={open}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '2.25rem',
        width: '2.25rem',
        borderRadius: '0.375rem',
        border: 0,
        cursor: 'pointer',
        background: hover ? 'var(--accent, rgba(127,127,127,0.15))' : 'transparent',
        color: 'var(--muted-foreground, #64748b)',
        transition: 'background-color .15s, color .15s',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      {count > 0 && (
        <span
          aria-label={`${count} nouveaux messages`}
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            minWidth: '16px',
            height: '16px',
            padding: '0 4px',
            borderRadius: '8px',
            background: '#e11d48',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 700,
            lineHeight: '16px',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
