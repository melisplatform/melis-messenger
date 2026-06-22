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

/**
 * After the profile iframe is up, switch it to the Messenger tab. We KEEP retrying (re-clicking the
 * tab link) until the tab is actually active: the profile finishes loading async and activates its
 * default (first) tab, so a single early click is lost — re-clicking until active wins the race.
 */
function activateMessengerTab() {
  let tries = 0
  const iv = window.setInterval(() => {
    tries++
    const frame = document.querySelector(`iframe[title="${PROFILE_FRAME_TITLE}"]`) as HTMLIFrameElement | null
    let doc: Document | null = null
    try { doc = frame?.contentDocument ?? null } catch { doc = null }
    if (doc) {
      const link = doc.querySelector(`a[href="${MESSENGER_TAB_HREF}"]`) as HTMLElement | null
      const li = link?.closest('li')
      if (li?.classList.contains('active')) { window.clearInterval(iv); return } // done
      if (link) link.click()
    }
    if (tries > 50) window.clearInterval(iv) // give up after ~20s
  }, 400)
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
    const w = window as unknown as { __melisOpenTab?: (t: { id: string; label: string; path: string }) => void }
    w.__melisOpenTab?.({ id: ACCOUNT_ROUTE, label: 'Messenger', path: ACCOUNT_ROUTE })
    navigate(ACCOUNT_ROUTE) // openTab registers the tab; navigation actually renders the profile zone
    activateMessengerTab()
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
