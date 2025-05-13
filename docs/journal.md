# Journal / Gratitude Module

## 1. Objective

Provide a daily journaling interface for users (admin role) to:
- Log emotional states (mood)
- Record gratitude/thoughts tied to moods
- Review past entries via date navigation
- Prepare for future data visualization & insights

## 2. User Role

- **Admin**: Full access to create/update journals and manage mood types
- **Guest**: No access to this module

## 3. Route Structure

- `GET /admin/tool/journal` – Main journal interface
- `GET /admin/operation/attitude` – Mood type manager

## 4. Features

### 4.1 Journal Interface (`/admin/tool/journal`)

#### Layout
- Date Picker with forward/backward navigation
- Autofill current date on load
- Search bar to jump to specific date

#### Mood Selector
- Choose 1 mood per day
- Most used moods shown as quick icons
- Option to "Add more" to expand full list
- Moods pulled from system config (`/admin/operation/attitude`)
- On change: triggers `auto-save + API PATCH`

#### Mood Entry
- For each journal entry, allow:
  - Select an icon (linked to mood type)
  - Add short content (text input)
- Minimum: 3 entries
- Allow dynamic “+ Add entry” button for more

#### UX Behavior
- `On blur (out focus)`: Auto-save via API
- `On component destroy`: Prompt via Web API `confirm()` if unsaved changes

### 4.2 Mood Type Management (`/admin/operation/attitude`)

#### Fields per mood type:
- `icon` (URL or text emoji)
- `name`
- `description`

#### Actions
- Add, Edit, Remove moods
- These moods are shared globally for all journal entries

## 5. Data Model & Schema

### 5.1 Journal Entry

\`\`\`ts
interface JournalEntry {
  id: string;
  date: string; // e.g. "2025-05-13"
  moodId: string; // reference to MoodType
  details: MoodItem[]; // 3 or more per day
  updatedAt: string;
}
\`\`\`

### 5.2 MoodItem (sub-entries in a journal)

\`\`\`ts
interface MoodItem {
  icon: string; // same set from MoodType
  content: string;
}
\`\`\`

### 5.3 MoodType

\`\`\`ts
interface MoodType {
  id: string;
  name: string;
  description: string;
  icon: string; // can be emoji or URL
  usageCount?: number; // optional, for future analytics
}
\`\`\`

## 6. Suggested APIs

### GET `/api/journal?date=YYYY-MM-DD`
> Get journal entry for a specific date

### PATCH `/api/journal/:id`
> Update journal entry (called on blur/change)

\`\`\`json
{
  "moodId": "sad123",
  "details": [
    { "icon": "😊", "content": "Had a good lunch with team" },
    { "icon": "🙏", "content": "Grateful for support from a friend" }
  ]
}
\`\`\`

### POST `/api/journal`
> Create entry if not existing (auto-init for new days)

### GET `/api/moods`
> Get all mood types

### POST `/api/moods`
> Create new mood

### PUT `/api/moods/:id`
> Update mood

### DELETE `/api/moods/:id`
> Delete mood

## 7. Angular Component Structure

### `/admin/tool/journal`

\`\`\`bash
journal/
├── journal.component.ts         # Main container
├── journal-header.component.ts  # Date nav + search
├── mood-selector.component.ts   # Mood buttons + add-more
├── journal-entries.component.ts # List of MoodItem input fields
└── journal.service.ts           # API calls
\`\`\`

### `/admin/operation/attitude`

\`\`\`bash
mood-admin/
├── mood-list.component.ts       # Table of moods
├── mood-form.component.ts       # Add/Edit modal
└── mood.service.ts              # API abstraction
\`\`\`

## 8. Future Enhancements (v2 roadmap)

- Monthly summary dashboard:
  - Pie chart of mood frequency
  - Bar graph of gratitude themes
  - "Most mentioned people/keywords"
- Search across past entries
- Export to Markdown/PDF
