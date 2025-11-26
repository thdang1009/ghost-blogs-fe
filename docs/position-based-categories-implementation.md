# Position-Based Categories - Simple Implementation

## Core Concept

**No category field needed.** Instead, use **position in the ordered list** to determine category:

- **Positions 1-N** = Today (N is editable number)
- **Positions N+1 to N+M** = Weekly (M is editable number)
- **Positions N+M+1 to N+M+K** = Monthly (K is editable number)
- **Rest** = Parking Lot

**Visual:** Background colors highlight which "zone" each task is in.

**Dynamic:** When you mark a Today task as DONE (and it disappears), the Weekly tasks automatically become Today tasks.

---

## User Settings

New editable numbers at top of todo list:

```
Today: [3▼]  Weekly: [5▼]  Monthly: [2▼]
────────────────────────────────────────
☐ Task 1     (pink background - Today)
☐ Task 2     (pink background - Today)
☐ Task 3     (pink background - Today)
☐ Task 4     (blue background - Weekly)
☐ Task 5     (blue background - Weekly)
...
```

**Inline editable:**
- Click number → becomes input
- Type new number → blur → auto-save
- Immediately re-color tasks

---

## Data Model

### Backend - New Model: UserTodoSettings

```javascript
const UserTodoSettingsSchema = new mongoose.Schema({
  user: { type: Number, required: true, unique: true },
  todayCount: { type: Number, default: 3 },
  weeklyCount: { type: Number, default: 5 },
  monthlyCount: { type: Number, default: 2 }
}, { timestamps: true });
```

### No changes to TodoToday model
Keep everything as-is. Just use existing `order` field.

---

## API Changes

### New Endpoint: User Settings

```javascript
// GET /v1/user-settings/todo
router.get('/todo', passportAuth, async (req, res) => {
  let settings = await UserTodoSettings.findOne({ user: req.user.id });
  if (!settings) {
    settings = await UserTodoSettings.create({
      user: req.user.id,
      todayCount: 3,
      weeklyCount: 5,
      monthlyCount: 2
    });
  }
  res.json(settings);
});

// PUT /v1/user-settings/todo
router.put('/todo', passportAuth, async (req, res) => {
  const settings = await UserTodoSettings.findOneAndUpdate(
    { user: req.user.id },
    {
      todayCount: req.body.todayCount,
      weeklyCount: req.body.weeklyCount,
      monthlyCount: req.body.monthlyCount
    },
    { new: true, upsert: true }
  );
  res.json(settings);
});
```

---

## Frontend Implementation

### Component State

```typescript
export class TodoTodayComponent {
  // Existing
  data: TodoToday[] = [];

  // NEW
  settings = {
    todayCount: 3,
    weeklyCount: 5,
    monthlyCount: 2
  };

  ngOnInit() {
    this.loadSettings();
    this.searchToDoToDay();
  }

  loadSettings() {
    this.userSettingsService.getTodoSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  updateSettings() {
    this.userSettingsService.updateTodoSettings(this.settings).subscribe();
  }
}
```

### Category Calculation

```typescript
getCategoryForIndex(index: number): string {
  const { todayCount, weeklyCount, monthlyCount } = this.settings;

  if (index < todayCount) return 'TODAY';
  if (index < todayCount + weeklyCount) return 'WEEKLY';
  if (index < todayCount + weeklyCount + monthlyCount) return 'MONTHLY';
  return 'PARKING_LOT';
}

getCategoryColor(category: string): string {
  const colors = {
    TODAY: '#ffe6e6',      // Light pink
    WEEKLY: '#e6f2ff',     // Light blue
    MONTHLY: '#e6ffe6',    // Light green
    PARKING_LOT: '#f5f5f5' // Light gray
  };
  return colors[category];
}

getTaskCategory(task: TodoToday): string {
  const index = this.data.indexOf(task);
  return this.getCategoryForIndex(index);
}
```

### Template Updates

```html
<!-- Settings at top -->
<div class="category-settings">
  <label>
    Today:
    <input type="number"
           [(ngModel)]="settings.todayCount"
           (blur)="updateSettings()"
           min="0" max="10">
  </label>

  <label>
    Weekly:
    <input type="number"
           [(ngModel)]="settings.weeklyCount"
           (blur)="updateSettings()"
           min="0" max="20">
  </label>

  <label>
    Monthly:
    <input type="number"
           [(ngModel)]="settings.monthlyCount"
           (blur)="updateSettings()"
           min="0" max="10">
  </label>
</div>

<!-- Task list with background colors -->
<div cdkDropList (cdkDropListDropped)="drop($event)">
  <div *ngFor="let item of data; let i = index"
       cdkDrag
       [style.background-color]="getCategoryColor(getTaskCategory(item))"
       class="task-item">

    <!-- Existing task content -->
    <mat-checkbox ...></mat-checkbox>
    <span>{{ item.content }}</span>

    <!-- NEW: Category badge -->
    <span class="category-badge">{{ getCategoryForIndex(i) }}</span>
  </div>
</div>
```

### Styling

```css
.category-settings {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: #fff;
  border-bottom: 2px solid #ddd;
  margin-bottom: 1rem;
}

.category-settings label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.category-settings input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
}

.task-item {
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.category-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  background: rgba(0,0,0,0.1);
  margin-left: auto;
}
```

---

## Drag and Drop (Already exists, just verify)

Existing drag-drop should work as-is. When user drags:
1. `moveItemInArray()` updates local array
2. Background colors auto-update based on new positions
3. Save new order to backend

---

## Behavior Examples

### Example 1: Mark Today Task as DONE

**Before:**
```
Today(3): Task A, Task B, Task C
Weekly(2): Task D, Task E
```

**Action:** Mark "Task A" as DONE

**After (Task A disappears from active view):**
```
Today(3): Task B, Task C, Task D  ← Task D promoted!
Weekly(2): Task E, (empty slot)
```

**Is this good or bad?**
✅ **GOOD** - Automatic prioritization
✅ Weekly tasks get promoted when you finish today's work
✅ Encourages completing high-priority items
⚠️ Can be surprising at first

**Solution:** Add visual cue when this happens (toast notification):
> "Task D promoted to Today"

---

### Example 2: Drag to Reorganize

**Before:**
```
1. Task A (Today - pink)
2. Task B (Today - pink)
3. Task C (Today - pink)
4. Task D (Weekly - blue)
```

**Action:** Drag "Task D" to position 2

**After:**
```
1. Task A (Today - pink)
2. Task D (Today - pink)  ← Now in Today zone!
3. Task B (Today - pink)
4. Task C (Weekly - blue) ← Pushed to Weekly
```

Automatic re-categorization based on position.

---

### Example 3: Increase Today Count

**Before (Today=3):**
```
1. Task A (Today - pink)
2. Task B (Today - pink)
3. Task C (Today - pink)
4. Task D (Weekly - blue)
```

**Action:** Change Today count to 4

**After (Today=4):**
```
1. Task A (Today - pink)
2. Task B (Today - pink)
3. Task C (Today - pink)
4. Task D (Today - pink)  ← Promoted by changing count!
5. Task E (Weekly - blue)
```

---

## Migration

**None needed!**

Just create default settings for existing users on first load.

---

## Implementation Checklist

### Backend (1-2 days)
- [ ] Create UserTodoSettings model
- [ ] Add GET /v1/user-settings/todo endpoint
- [ ] Add PUT /v1/user-settings/todo endpoint
- [ ] Test endpoints

### Frontend (2-3 days)
- [ ] Create UserSettingsService
- [ ] Add settings UI (3 number inputs)
- [ ] Add getCategoryForIndex() method
- [ ] Add getCategoryColor() method
- [ ] Apply background colors to tasks
- [ ] Add category badges (optional)
- [ ] Wire up blur event to save settings
- [ ] Verify drag-drop still works
- [ ] Add CSS styling
- [ ] Test on different screen sizes

### Total: 3-5 days

---

## Pros

✅ **Super simple** - No schema changes to TodoToday
✅ **Flexible** - Users control their own limits
✅ **Visual** - Clear color coding
✅ **Dynamic** - Auto-promotion feels productive
✅ **Drag-drop** - Full manual control
✅ **Fast to build** - Minimal code

## Cons

⚠️ **Unexpected promotions** - Tasks auto-move up (can surprise users)
⚠️ **No hard limits** - Can't prevent adding 10 "today" tasks (just visual)
⚠️ **Depends on order** - Order becomes critical

## Recommendation

Add a **visual separator** between zones to make it crystal clear:

```
Today (3)
──────────────
Task A
Task B
Task C
──────────────
Weekly (5)
──────────────
Task D
Task E
...
```

This makes the boundaries obvious.

---

## Next Steps

1. ✅ Review this doc
2. Start backend implementation (UserTodoSettings)
3. Start frontend implementation (settings UI + colors)
4. Test drag-drop behavior
5. Ship it!
