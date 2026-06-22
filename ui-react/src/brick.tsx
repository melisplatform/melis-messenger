import MessengerHeader from './MessengerHeader'

/**
 * Brick entry point. MelisMessenger registers a single thing, gated on the module being active:
 *  - Header : a topbar widget (the messenger icon + unread badge, next to the language switcher).
 *    Clicking it opens the user profile and its dynamically-added Messenger tab (legacy tool).
 * There is no routed page: the messenger UI lives as a tab inside the user profile, not standalone.
 * React / ReactRouter are EXTERNAL (host globals) so hooks/Router/context are shared.
 */
declare global {
  interface Window {
    __melisRegisterBrick?: (b: { id: string; Component?: unknown; Sidebar?: unknown; Header?: unknown }) => void
  }
}

window.__melisRegisterBrick?.({ id: 'messenger', Header: MessengerHeader })
