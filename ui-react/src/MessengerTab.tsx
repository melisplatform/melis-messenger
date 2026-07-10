import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Onglet « Melis Messenger » NATIF (React) de « Mon compte ».
 *
 * Fourni de façon MODULAIRE par le module melis-messenger (enregistré dans le point d'extension
 * `window.__melisAccountTabs` par brick.tsx, présent ssi le module est actif). Réutilise les
 * endpoints JSON existants du contrôleur legacy (contacts / conversation / envoi / polling) — la
 * logique métier reste côté Melis, React = présentation.
 *
 * Styles inline + variables CSS de l'hôte (la brique n'a pas le build Tailwind de l'hôte).
 */

const H = { 'X-Requested-With': 'XMLHttpRequest' } as const
const URL_CONTACTS = '/melis/MelisMessenger/MelisMessenger/getContactList'
const URL_CONVO    = '/melis/MelisMessenger/MelisMessenger/getConversation'
const URL_SEND     = '/melis/MelisMessenger/MelisMessenger/saveMessage'
const URL_INTERVAL = '/melis/MelisMessenger/MelisMessenger/getMsgTimeInterval'
const URL_USERS    = '/melis/MelisMessenger/MelisMessenger/getUserListForConversation'
const URL_CREATE   = '/melis/MelisMessenger/MelisMessenger/createConversation'

interface ContactRow {
  msgr_msg_id: number
  contact_id: number
  usrInfo: { name: string; isOnline: number; image: string; message: string }[]
}
interface Message {
  msgr_msg_cont_id: number
  msgr_msg_cont_sender_id: number
  msgr_msg_cont_message: string
  msgr_msg_cont_date: string
  usr_firstname: string
  usr_lastname: string
  usr_image: string
}
interface UserRow { id: number; name: string; login: string; image: string; isOnline: number }

const T = {
  fr: { contacts: 'Contacts', chat: 'Conversation', empty: 'Sélectionnez un contact pour afficher la conversation.', noContacts: 'Aucun contact.', placeholder: 'Écrivez un message…', send: 'Envoyer', online: 'En ligne', offline: 'Hors ligne', newConvo: 'Nouvelle conversation', searchUser: 'Rechercher un utilisateur…', noUser: 'Aucun utilisateur trouvé.', back: 'Retour' },
  en: { contacts: 'Contacts', chat: 'Chat', empty: 'Please select a contact to display the conversation.', noContacts: 'No contact.', placeholder: 'Write a message…', send: 'Send', online: 'Online', offline: 'Offline', newConvo: 'New conversation', searchUser: 'Search a user…', noUser: 'No user found.', back: 'Back' },
}
function lang(): 'fr' | 'en' {
  const l = (typeof document !== 'undefined' ? document.documentElement.lang : 'en') || 'en'
  return l.slice(0, 2).toLowerCase() === 'fr' ? 'fr' : 'en'
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: H, credentials: 'include' })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch { return null }
}

export default function MessengerTab() {
  const t = T[lang()]
  const [contacts, setContacts] = useState<ContactRow[]>([])
  const [activeConvo, setActiveConvo] = useState<number | null>(null)
  // Interlocuteur actif (nom/avatar) — sert d'entête du chat même pour une conversation neuve que
  // getContactList ne renvoie pas encore (pas de message → absente de la liste).
  const [activePeer, setActivePeer] = useState<{ name: string; image: string } | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [meId, setMeId] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [pollMs, setPollMs] = useState(60000)
  const bottomRef = useRef<HTMLDivElement>(null)
  // Nouvelle conversation (recherche d'utilisateur, comme le legacy).
  const [newOpen, setNewOpen] = useState(false)
  const [users, setUsers] = useState<UserRow[]>([])
  const [query, setQuery] = useState('')
  const [starting, setStarting] = useState(false)

  const loadContacts = useCallback(async () => {
    const d = await getJson<{ data: ContactRow[] }>(URL_CONTACTS)
    if (d?.data) setContacts(d.data)
  }, [])

  const loadConvo = useCallback(async (convoId: number) => {
    const d = await getJson<{ data: Message[]; user_id: number }>(`${URL_CONVO}/${convoId}?limit=50&offset=0`)
    if (d) { setMessages(d.data || []); setMeId(d.user_id) }
  }, [])

  useEffect(() => { loadContacts() }, [loadContacts])
  useEffect(() => { getJson<{ interval: number }>(URL_INTERVAL).then((d) => { if (d?.interval) setPollMs(d.interval) }) }, [])

  // Polling : rafraîchit la conversation ouverte + la liste des contacts.
  useEffect(() => {
    const iv = window.setInterval(() => { loadContacts(); if (activeConvo != null) loadConvo(activeConvo) }, pollMs)
    return () => window.clearInterval(iv)
  }, [activeConvo, pollMs, loadContacts, loadConvo])

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: 'end' }) }, [messages])

  function openContact(c: ContactRow) {
    const info = c.usrInfo[0]
    setActivePeer(info ? { name: info.name, image: info.image } : null)
    setActiveConvo(c.msgr_msg_id)
    setMessages([])
    loadConvo(c.msgr_msg_id)
  }

  async function openNewConvoPanel() {
    setNewOpen(true); setQuery('')
    const d = await getJson<{ data: UserRow[] }>(URL_USERS)
    if (d?.data) setUsers(d.data)
  }

  // Démarre (ou rouvre) une conversation avec l'utilisateur choisi.
  async function startConversation(u: UserRow) {
    if (starting) return
    setStarting(true)
    try {
      // Si une conversation existe déjà avec ce contact → la rouvrir (pas de doublon).
      const existing = contacts.find((c) => c.contact_id === u.id)
      if (existing) { setNewOpen(false); openContact(existing); return }
      const body = new URLSearchParams({ mbrids: String(u.id) })
      const r = await fetch(URL_CREATE, { method: 'POST', headers: { ...H, 'Content-Type': 'application/x-www-form-urlencoded' }, credentials: 'include', body })
      const d = await r.json().catch(() => null)
      const convoId = Number(d?.conversationId ?? 0)
      setNewOpen(false)
      if (convoId > 0) {
        // Entête + sélection immédiate, et ajout OPTIMISTE dans la liste (getContactList ne renverra
        // la nouvelle conversation qu'après le 1er message envoyé).
        setActivePeer({ name: u.name, image: u.image })
        setActiveConvo(convoId)
        setMessages([])
        setContacts((prev) => prev.some((c) => c.msgr_msg_id === convoId)
          ? prev
          : [{ msgr_msg_id: convoId, contact_id: u.id, usrInfo: [{ name: u.name, isOnline: u.isOnline, image: u.image, message: '' }] }, ...prev])
        loadConvo(convoId)
      }
      loadContacts()
    } finally { setStarting(false) }
  }

  async function send() {
    const msg = text.trim()
    if (!msg || activeConvo == null || sending) return
    setSending(true)
    try {
      const body = new URLSearchParams({ msgr_msg_id: String(activeConvo), msgr_msg_cont_message: msg })
      const r = await fetch(URL_SEND, { method: 'POST', headers: { ...H, 'Content-Type': 'application/x-www-form-urlencoded' }, credentials: 'include', body })
      const d = await r.json().catch(() => null)
      if (d?.success) { setText(''); await loadConvo(activeConvo); loadContacts() }
    } finally { setSending(false) }
  }

  return (
    <div style={S.wrap}>
      {/* Contacts */}
      <div style={S.contactsCol}>
        <div style={{ ...S.panelHead, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{newOpen ? t.newConvo : t.contacts}</span>
          <button type="button" title={newOpen ? t.back : t.newConvo}
            onClick={() => (newOpen ? setNewOpen(false) : openNewConvoPanel())} style={S.plusBtn}>
            {newOpen ? '×' : '+'}
          </button>
        </div>

        {newOpen ? (
          <div style={S.contactsList}>
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchUser} style={{ ...S.input, width: '100%', margin: '2px 0 8px' }} />
            {users.filter((u) => (u.name + ' ' + u.login).toLowerCase().includes(query.trim().toLowerCase())).length === 0 && (
              <div style={S.muted}>{t.noUser}</div>
            )}
            {users
              .filter((u) => (u.name + ' ' + u.login).toLowerCase().includes(query.trim().toLowerCase()))
              .map((u) => (
                <button key={u.id} type="button" disabled={starting} onClick={() => startConversation(u)} style={S.contactRow}>
                  <div style={S.avatarWrap}>
                    <img src={u.image} alt="" style={S.avatar} />
                    <span style={{ ...S.dot, background: u.isOnline ? '#22c55e' : '#9ca3af' }} />
                  </div>
                  <div style={{ minWidth: 0, textAlign: 'left' }}>
                    <div style={S.contactName}>{u.name}</div>
                    <div style={S.contactMsg}>{u.login}</div>
                  </div>
                </button>
              ))}
          </div>
        ) : (
          <div style={S.contactsList}>
            {contacts.length === 0 && <div style={S.muted}>{t.noContacts}</div>}
            {contacts.map((c) => {
              const info = c.usrInfo[0]
              const active = c.msgr_msg_id === activeConvo
              return (
                <button key={c.msgr_msg_id} type="button" onClick={() => openContact(c)}
                  style={{ ...S.contactRow, ...(active ? S.contactRowActive : null) }}>
                  <div style={S.avatarWrap}>
                    <img src={info?.image} alt="" style={S.avatar} />
                    <span style={{ ...S.dot, background: info?.isOnline ? '#22c55e' : '#9ca3af' }} />
                  </div>
                  <div style={{ minWidth: 0, textAlign: 'left' }}>
                    <div style={S.contactName}>{info?.name}</div>
                    <div style={S.contactMsg} dangerouslySetInnerHTML={{ __html: stripTags(info?.message || '') }} />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Chat */}
      <div style={S.chatCol}>
        <div style={S.panelHead}>{activePeer?.name ?? t.chat}</div>
        {activeConvo == null ? (
          <div style={S.emptyChat}>{t.empty}</div>
        ) : (
          <>
            <div style={S.messages}>
              {messages.map((m) => {
                const mine = meId != null && m.msgr_msg_cont_sender_id === meId
                return (
                  <div key={m.msgr_msg_cont_id} style={{ ...S.msgRow, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    {!mine && <img src={m.usr_image} alt="" style={S.msgAvatar} />}
                    <div style={{ ...S.bubble, ...(mine ? S.bubbleMine : S.bubbleTheirs) }}>
                      <div style={S.bubbleMeta}>{mine ? '' : `${m.usr_firstname} ${m.usr_lastname} · `}{m.msgr_msg_cont_date}</div>
                      <div dangerouslySetInnerHTML={{ __html: m.msgr_msg_cont_message }} />
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
            <div style={S.composer}>
              <input value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder={t.placeholder} style={S.input} />
              <button type="button" onClick={send} disabled={sending || !text.trim()} style={S.sendBtn}>{t.send}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, minHeight: 460 },
  contactsCol: { display: 'flex', flexDirection: 'column', border: '1px solid var(--border,#e4e7ea)', borderRadius: 8, overflow: 'hidden' },
  chatCol: { display: 'flex', flexDirection: 'column', border: '1px solid var(--border,#e4e7ea)', borderRadius: 8, overflow: 'hidden', minHeight: 460 },
  panelHead: { padding: '10px 14px', fontWeight: 600, fontSize: 13, background: 'var(--muted,#f4f5f7)', borderBottom: '1px solid var(--border,#e4e7ea)', color: 'var(--foreground,#1f2937)' },
  plusBtn: { width: 24, height: 24, lineHeight: '22px', textAlign: 'center', borderRadius: 6, border: '1px solid var(--border,#e4e7ea)', background: 'var(--card,#fff)', color: 'var(--foreground,#1f2937)', fontSize: 16, cursor: 'pointer', padding: 0 },
  contactsList: { flex: 1, overflowY: 'auto', padding: 6 },
  muted: { padding: 12, color: 'var(--muted-foreground,#6b7280)', fontSize: 13 },
  contactRow: { display: 'flex', gap: 10, alignItems: 'center', width: '100%', padding: '8px 10px', border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer' },
  contactRowActive: { background: 'var(--accent,#eef2ff)' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', display: 'block' },
  dot: { position: 'absolute', right: 0, bottom: 0, width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--card,#fff)' },
  contactName: { fontSize: 13, fontWeight: 600, color: 'var(--foreground,#1f2937)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  contactMsg: { fontSize: 12, color: 'var(--muted-foreground,#6b7280)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  emptyChat: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground,#6b7280)', fontSize: 14, padding: 24, textAlign: 'center' },
  messages: { flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  msgRow: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  msgAvatar: { width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  bubble: { maxWidth: '72%', padding: '8px 12px', borderRadius: 12, fontSize: 13, lineHeight: 1.4 },
  bubbleMine: { background: 'var(--primary,#cb4040)', color: '#fff', borderBottomRightRadius: 4 },
  bubbleTheirs: { background: 'var(--muted,#f1f3f5)', color: 'var(--foreground,#1f2937)', borderBottomLeftRadius: 4 },
  bubbleMeta: { fontSize: 10, opacity: 0.7, marginBottom: 3 },
  composer: { display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border,#e4e7ea)' },
  input: { flex: 1, height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border,#e4e7ea)', background: 'var(--background,#fff)', color: 'var(--foreground,#1f2937)', fontSize: 13, outline: 'none' },
  sendBtn: { height: 38, padding: '0 18px', borderRadius: 8, border: 'none', background: 'var(--primary,#cb4040)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
}
