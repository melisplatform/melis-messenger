import MessengerHeader from './MessengerHeader'
import MessengerTab from './MessengerTab'

/**
 * Brick entry point. MelisMessenger, gaté sur le module actif, enregistre DEUX choses :
 *  - Header : le widget topbar (icône messenger + badge non-lus, à côté du sélecteur de langue).
 *    Un clic ouvre « Mon compte » et son onglet Messenger.
 *  - Onglet « Melis Messenger » de « Mon compte » : ajouté de façon MODULAIRE au point d'extension
 *    `window.__melisAccountTabs` (cf. melis-core lib/account-tabs), donc présent SSI le module est
 *    actif — exactement comme les encarts de l'outil News. Contenu = MessengerTab (React natif).
 *
 * React / ReactRouter sont EXTERNES (globals de l'hôte) → hooks/Router/contexte partagés.
 */
interface AccountTabDef {
  id: string
  label: string
  icon?: unknown
  render: () => unknown
  order?: number
}
declare global {
  interface Window {
    __melisRegisterBrick?: (b: { id: string; Component?: unknown; Sidebar?: unknown; Header?: unknown }) => void
    __melisIsModuleActive?: (id: string) => boolean
    __melisAccountTabs?: AccountTabDef[]
  }
}

const ACCOUNT_TABS_EVENT = 'melis-account-tabs-changed'

function isModuleActive(): boolean {
  return typeof window.__melisIsModuleActive === 'function'
    ? window.__melisIsModuleActive('MelisMessenger')
    : true // hôte trop ancien → on suppose actif.
}

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

if (typeof window !== 'undefined') {
  // Onglet « Melis Messenger » dans « Mon compte » (modulaire, gaté sur module actif).
  if (!window.__melisAccountTabs) window.__melisAccountTabs = []
  if (isModuleActive() && !window.__melisAccountTabs.some((t) => t.id === 'messenger')) {
    window.__melisAccountTabs.push({
      id: 'messenger',
      label: 'Melis Messenger',
      icon: <ChatIcon />,
      order: 10,
      render: () => <MessengerTab />,
    })
    window.dispatchEvent(new CustomEvent(ACCOUNT_TABS_EVENT))
  }
}

// Header topbar + enregistrement de la brique (active la détection isModuleActive).
window.__melisRegisterBrick?.({ id: 'messenger', Header: MessengerHeader })
