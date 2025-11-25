Product Requirements Document (PRD)
Project Name: Minimalist Manual List Manager Version: 1.0 Objective: To provide a minimalist, user-controlled task management interface that enforces specific list constraints and manual categorization without AI-driven reorganization.

1. Core Philosophy & Constraints
No Auto-Magic: The system must never auto-sort, auto-categorize, or interpret the "meaning" of a task (e.g., distinguishing goals vs. tasks). The user has 100% manual control.

Minimalism: The UI must remain clean. No bolding, extra descriptions, or rich text formatting unless explicitly entered by the user.

Stability: The Voice-to-Text feature must be robust and crash-proof.

2. List Structure & Limits
The dashboard consists of 4 vertical sections fixed in the following order (Top to Bottom):

2.1. Today
Position: Top.

Item Limit: Maximum 3 items.

Behavior: If the user tries to add a 4th item, the system must show a blocking error or prompt to move an item to another list.

2.2. Weekly Commitments
Position: Below "Today".

Item Limit: Maximum 5 items.

2.3. Monthly Focus
Position: Below "Weekly Commitments".

Item Limit: Maximum 2 items.

2.4. Parking Lot
Position: Bottom.

Item Limit: Unlimited.

Default Behavior: If a task is added without a specified category, it defaults here.

3. Functional Requirements (Frontend)
3.1. Global "Add Task" Button
UI Element: A medium-sized + button located at the top of the screen (sticky or header).

Interaction: Clicking opens a Task Entry Modal (or Popup).

Modal Components:

Input Field: Text area for typing or displaying voice transcript.

Voice Input Button: Tapping starts recording -> converts to text in the Input Field.

Category Selector: A dropdown or radio button set (Today, Weekly, Monthly, Parking Lot).

Logic: If a category is full (e.g., Today has 3 items), that option should be disabled or show a warning.

Confirm Button: Saves the task to the selected category.

3.2. Contextual "Add Task" Buttons
UI Element: A small, minimalist + icon next to each Section Header (e.g., next to "Today").

Interaction: Immediately opens an input field for that specific list.

Validation: The button should be disabled or hidden if the list has reached its item limit (e.g., hidden if Today has 3 items).

3.3. Task Display & Style
Formatting: Render text exactly as input. Support all Unicode emojis and icons.

No Auto-Formatting: Do not apply bold, italics, or hierarchy unless the user typed Markdown characters.

Tagging: Display user's existing tagging style (e.g., #tag) as plain text or simple highlights, but do not alter the text.

3.4. Voice-to-Text Integration
Input: User speaks into the microphone.

Processing: Convert audio to text.

Refinement (Optional): Use a lightweight script to clean up "ums" and "ahs" but strictly preserve the original meaning and phrasing. Do not summarize.

Output: The text appears in the input box for user verification before adding.

4. Functional Requirements (Backend)
4.1. Data Model
Task Entity:
... existing
category: Enum (TODAY, WEEKLY, MONTHLY, PARKING_LOT)

4.2. API Logic & Validation

Validation Rule:

Before inserting, query the count of active tasks in the target category.

If category == TODAY and count >= 3, return Error LIMIT_REACHED.

If category == WEEKLY and count >= 5, return Error LIMIT_REACHED.

If category == MONTHLY and count >= 2, return Error LIMIT_REACHED.

PARKING_LOT has no count check.

4.3. Voice Processing Service
Ensure the connection to the STT (Speech-to-Text) service involves error handling (retries) to prevent app crashes if the API times out.

1. User Stories (Acceptance Criteria)
Add to Today: As a user, I click the global "+", type "Finish Report", select "Today", and see it appear at the top.

Limit Enforcement: As a user, if I already have 3 items in "Today", I cannot add a 4th one until I mark one as complete or delete it.

Voice Entry: As a user, I use the voice button to dictate a thought. The text appears in the box. I then select "Parking Lot" to save it for later.

Visuals: As a user, I see my tasks exactly as I typed them, with my specific emojis, and no AI has rewritten them.