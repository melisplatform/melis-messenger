---
title: MelisMessenger module
package: melisplatform/melis-messenger
doc_type: module-documentation
audience: ai
language: en
module_version: unversioned   # no `version` field in composer.json; this doc tracks the current source
last_reviewed: 2026-06-08
maintainer: Melis Technology
keywords: [messenger, messaging, chat, conversation, internal, users, collaborators, notifications, melis, back-office, core]
screenshots_dir: ./images
---

# MelisMessenger Module — Functional Documentation (for AI)

> **Purpose of this document**: describe, functionally and technically, the
> `melisplatform/melis-messenger` module, so that an AI (or a developer) can understand
> *what the module does*, *which tools it provides*, *how they work* and
> *where the corresponding code lives*.
>
> **Audience**: consumed by the **MelisAI** module (a MelisPlatform module that exposes an
> MCP function to answer user questions). MelisAI fetches this `.md` file and the
> screenshots in `./images/` **on demand** — so the doc is self-contained and §9 acts as
> the filename→content index for retrieving a specific screenshot.
>
> **Status**: reviewed 2026-06-08 against the current source. The module carries no
> semantic version (no `version` in `composer.json`), so treat this doc as describing the
> current `melisplatform/melis-messenger` source rather than a tagged release.
>
> Screenshots live in `./images/` (relative paths `./images/...`).

---

## 1. Overview

`MelisMessenger` provides an **internal messaging system inside the platform** so that
collaborators (back-office users) can talk to each other. It adds a **Messenger tab in the
user Profile** where users hold conversations, and a **header icon** that surfaces new/unread
messages. Conversations are between two or more users, refresh on a polling interval, and
can be created by picking recipients.

| Item | Value |
|---|---|
| Package name | `melisplatform/melis-messenger` |
| Type | `melisplatform-module` |
| PHP namespace | `MelisMessenger\` → `src/` (PSR-4) |
| Melis category | `core` |
| License | OSL-3.0 |
| PHP required | `^8.1 | ^8.3` |
| Framework | Laminas (ex-Zend Framework 2/3), Melis MVC architecture |
| dbdeploy | `true` (DB migrations applied automatically) |
| Recipient picker | **tokenize2** (`public/plugins/tokenize2.*`) |

### Dependencies (required Melis modules)

Declared in `composer.json`:

- `melisplatform/melis-core` (`^5.2`) — foundation, users, rights, services, events, the
  back-office header and user-profile interface this module hooks into

This is a **core-category** module: it depends only on `melis-core` (no CMS), since
conversations are between **platform users**, not tied to sites/pages.

---

## 2. Functional concepts

- **Conversation** (`melis_messenger_msg`): a thread, with a creator and a creation date.
- **Members** (`melis_messenger_msg_members`): the users participating in a conversation
  (a conversation links to its member user ids).
- **Messages** (`melis_messenger_msg_content`): the individual messages of a conversation —
  each with a sender, body, date and a **status** (used for read/unread).
- **Notifications**: the header icon shows new messages; the message panel **polls** for new
  messages on a configurable interval (default **60 s**, `msg_interval`).
- **Rights**: access to the messenger is gated by user rights
  (`getUserRightsForMessenger`).

### Data model (MySQL tables)

| Table | Role | Primary key |
|---|---|---|
| `melis_messenger_msg` | A conversation (`msgr_msg_creator_id`, `msgr_msg_date_created`) | `msgr_msg_id` |
| `melis_messenger_msg_members` | A user participating in a conversation (`msgr_msg_id`, `msgr_msg_mbr_usr_id`) | `msgr_msg_mbr_id` |
| `melis_messenger_msg_content` | A message in a conversation (`msgr_msg_cont_sender_id`, `msgr_msg_cont_message`, date, `msgr_msg_cont_status`) | `msgr_msg_cont_id` |

- A message/member references its conversation via `msgr_msg_id` → `melis_messenger_msg.msgr_msg_id`.
- MySQL Workbench model: `install/sql/Model/MelisMessenger.mwb`
- Base structure: `install/sql/setup_structure.sql`
- Incremental migrations: `install/dbdeploy/*.sql`

---

## 3. Tools and elements provided

The module exposes:

1. **The Messenger tab** (in the user Profile) — conversations, contacts, message thread
2. **The header messages icon** — new-message notifications
3. **An application service** — send/read messages, manage conversations
4. **A recipient input element** — tokenize2-based user picker

Everything is driven by `src/Controller/MelisMessengerController.php`.

---

### 3.1 Messenger tab (user Profile)

Injected as a tab in the back-office **user Profile** (declared in `config/app.interface.php`
under `meliscore_user_profile_tabs`, key `melismessenger_tool`, icon `comments`).

- **Controller**: `src/Controller/MelisMessengerController.php`
- **Views**: `view/melis-messenger/melis-messenger/*.phtml`
- **Forms**: `config/app.forms.php`

Render areas (declared under `melismessenger_tool`):
- **Tool content** (`renderMessengerToolContentAction`, JS `messengerTool.loadMessages()`)
  — the conversation/message thread; new messages are loaded by polling.
- **Contacts** (`renderMessengerContactAction`, JS `messengerTool.loadContact()`) — the
  contact list to start or open a conversation.

Key controller actions:
- **Start a conversation**: `createConversationAction` (recipients picked via the tokenize2
  input) → `MelisMessengerService::prepareConversationId()` / `saveMsg` + `saveMsgMembers`
- **Send a message**: `saveMessageAction` → `MelisMessengerService::saveMsgContent()`
- **Read a thread**: `getConversationAction` (+ `getNewMessageAction`, `getLastMessageAction`)
- **Mark read / status**: `updateMessageStatusAction` → `updateMessageStatus()`
- **Contacts**: `getContactListAction` → `getContactList()`
- **Refresh interval**: `getMsgTimeIntervalAction` (the polling period, default 60 s)
- **Rights**: `getUserRightsForMessengerAction` → `getUserRightsForMessenger()`

![Messenger tab in the user Profile](./images/melismessenger-tool-profile-tab-messenger.png)
*Caption: the Messenger tab in the user Profile — the conversation list, the open message
thread, the contacts/recipient picker (tokenize2) and the input to send a new message.*

---

### 3.2 Header messages icon (notifications)

Injected into the back-office **header** (declared in `config/app.interface.php` under
`meliscore_header`, key `melismessenger_tool_header_messages`). Rendered by
`headerMessengerAction` — shows the new/unread messages indicator and a quick view, so users
see incoming messages from anywhere in the back-office.

![Header messages icon — new-message notifications](./images/melismessenger-platformheader-iconmessenger.png)
*Caption: the header messages icon and its dropdown — new/unread message notifications shown
across the back-office.*

---

### 3.3 Application service `MelisMessengerService`

- **File**: `src/Service/MelisMessengerService.php`
- **Service manager alias**: `MelisMessengerService`

Usage from another module:

```php
$messengerService = $this->getServiceManager()->get('MelisMessengerService');
$convo_id = $messengerService->saveMsg(array(/* ... */));
```

Public methods:

| Method | Role |
|---|---|
| `saveMsg($data)` | Create/update a conversation |
| `saveMsgMembers($data)` | Add a member (user) to a conversation |
| `saveMsgContent($data)` | Save a message into a conversation |
| `getConversation($id)` | The messages of a conversation |
| `getConversationWithLimit($id, $limit = 10, $offset = 0)` | A paginated slice of a conversation |
| `getNewMessage($id)` | New messages since last poll |
| `updateMessageStatus($data, $msg_id, $user_id)` | Update a message's read/status |
| `getContactList($convo_id, $user_id)` | The contacts available to message |
| `prepareConversationId($userId)` | Resolve/create the conversation id for a recipient set |
| `getUserRightsForMessenger()` | The current user's messenger access rights |

#### Service events

Each read/list method fires `*_start` / `*_end` events (e.g.
`melismessenger_get_conversation_start` / `_end`, `melismessenger_get_contact_list_start` /
`_end`, `melismessenger_access_rights_end`), letting other modules intercept the data.

#### Tables (Table Gateways)

Declared as aliases in `config/module.config.php`: `MelisMessengerMsgTable`
(→ `melis_messenger_msg`), `MelisMessengerMsgContentTable` (→ `melis_messenger_msg_content`),
`MelisMessengerMsgMembersTable` (→ `melis_messenger_msg_members`), in `src/Model/Tables/`.

---

### 3.4 Recipient input element

- `MelisMessengerInput` — factory `src/Form/Factory/MelisMessengerInputFactory.php`
  (registered in `config/module.config.php`). A **tokenize2**-backed multi-select input to
  pick the user(s) a conversation is addressed to.

---

## 4. Internationalization & diagnostic

- Translation files: `language/en_EN.interface.php`, `language/fr_FR.interface.php`; keys use
  the `tr_melismessenger_*` prefix. Loaded via `Module::createTranslations()`.
- `config/diagnostic.config.php` — module health checks (Melis diagnostic system).

---

## 5. Front assets

Declared in `config/app.interface.php` (key `ressources`):

- **Recipient picker**: `public/plugins/tokenize2.min.js`, `tokenize2.min.css`
- **JS (tool)**: `public/js/tools/messenger-tool.js`
- **CSS**: `public/css/messenger-tool.css`
- **Compiled bundle**: `public/build/css/bundle.css`, `public/build/js/bundle.js`

---

## 6. Quick code map

```
melis-messenger/
├── composer.json                 → module dependencies & metadata (category: core, dbdeploy: true)
├── config/
│   ├── module.config.php         → routes, service, tables, controllers, form element
│   ├── app.interface.php         → header icon + Messenger tab in the user Profile
│   ├── app.forms.php             → messenger forms (conversation / message / recipients)
│   ├── app.tools.php             → tool configuration
│   └── diagnostic.config.php     → diagnostic tests
├── src/
│   ├── Module.php                → bootstrap, translations
│   ├── Controller/               → MelisMessengerController (tab + header + AJAX), MelisSetupController
│   ├── Service/                  → MelisMessengerService (conversations, messages, contacts, rights)
│   ├── Model/ + Model/Tables/    → conversation / content / members models + table gateways
│   └── Form/Factory/             → MelisMessengerInputFactory (tokenize2 recipient picker)
├── view/                         → .phtml templates (messenger tab, contacts, header, thread)
├── public/                       → tokenize2, tool JS/CSS, bundles
├── language/                     → en_EN / fr_FR translations
├── install/                      → SQL (structure, MWB model, dbdeploy migration)
└── etc/                          → MarketPlace (xml) + MelisAI/doc (this doc)
```

---

## 7. Typical messaging lifecycle

1. **Open** the Messenger tab from the user Profile (or click the header messages icon).
2. **Pick recipients** (tokenize2) and **start a conversation** → `createConversationAction`
   → `prepareConversationId` / `saveMsg` + `saveMsgMembers`.
3. **Send messages** → `saveMessageAction` → `saveMsgContent` (`melis_messenger_msg_content`).
4. **Read / receive**: the thread polls for new messages (default every 60 s); the header
   icon flags new ones; opening marks them read (`updateMessageStatus`).
5. **From other modules**: call `MelisMessengerService` (e.g. `saveMsg`) to create
   conversations programmatically; hook the `melismessenger_*` events to react.

---

## 8. Screenshot index (for on-demand retrieval)

All screenshots live in `./images/` (i.e. `/etc/MelisAI/doc/images/`). This table is the
**filename → content** index the MelisAI MCP uses to fetch a specific screenshot on demand;
each row's caption in the body gives the text-only description of what the image shows.

| Image file | Content |
|---|---|
| `melismessenger-tool-profile-tab-messenger.png` | Messenger tab in the user Profile (conversation thread + contacts + send) |
| `melismessenger-platformheader-iconmessenger.png` | Header messages icon — new-message notifications |

---

*Document for AI consumption (MelisAI MCP) — describes the `melisplatform/melis-messenger`
module. Last reviewed 2026-06-08 against the current source.*
