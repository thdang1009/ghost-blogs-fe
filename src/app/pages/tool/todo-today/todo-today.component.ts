import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import {
  TodoBoard,
  TodoBoardStats,
  TodoLabel,
  TodoRecurrence,
  TodoSoftCap,
  TodoToday,
  TriageDecision,
  UserTodoSettings,
} from '@models/_index';
import { MatDialog } from '@angular/material/dialog';
import { TodoRecurrenceDialogComponent } from './todo-recurrence-dialog/todo-recurrence-dialog.component';
import * as dateFns from 'date-fns';
import {
  AlertService,
  TodoLabelService,
  TodoRecurrenceService,
  TodoTodayService,
  UserSettingsService,
  UserRewardService,
} from '@services/_index';
import {
  nextStatus,
  previousStatus,
  toggleStatus,
  calculateSimilarity,
} from '@shared/common';
import { TDTD_STATUS } from '@shared/enum';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as dateFnsFormat from 'date-fns';
import { effectiveWeight, sortTodos } from './todo-weight.util';

const SIMILARITY_THRESHOLD = 80; // 80% similarity threshold
const FINISH_WORDS = ['done', 'xong', 'finish', 'completed', 'đã'];
const INPUT_WORDS = ['add', 'new', 'thêm', 'mới', 'tạo'];
const IN_PROGRESS_WORDS = ['progress', 'đang', 'chưa'];
@Component({
  selector: 'app-todo-today',
  templateUrl: './todo-today.component.html',
  styleUrls: ['./todo-today.component.scss'],
})
export class TodoTodayComponent implements OnInit, OnDestroy {
  data: TodoToday[] = [];
  dataLabel: TodoLabel[] = [];
  isLoadingResults = true;
  callListIdTimeout = undefined;
  hoveredIndex: number | undefined;

  today = dateFns.startOfToday();
  searchDate = new UntypedFormControl(this.today);
  searchDateDisplay = 'ToDay';
  searchStatus: string | undefined = TDTD_STATUS.NONE;
  statusList = ['NONE', 'NOT_YET', 'DONE', 'TOMORROW', 'IN_PAST'];
  count = 0;
  nextStatus = nextStatus;
  previousStatus = previousStatus;
  TDTD_STATUS = TDTD_STATUS;

  // Voice recognition properties
  isListening = false;
  showTranscript = '';
  recognition: any;
  currentLanguage: 'en' | 'vi' = 'vi';
  statusKeywords = [...FINISH_WORDS, ...IN_PROGRESS_WORDS, ...INPUT_WORDS];

  // Search form toggle
  isSearchFormExpanded = false;

  // Ba trường đếm VẪN CÒN nhưng đổi nghĩa: từ "cắt danh sách theo vị trí"
  // thành hạn mức MỀM, chỉ dùng để cảnh báo (§D1).
  settings: UserTodoSettings = {
    todayCount: 3,
    weeklyCount: 5,
    monthlyCount: 2,
    sortByWeight: true,
    focusCount: 1,
    endOfDayHour: 20,
    autoDeferAtNight: true,
    maxDeferBeforeBacklog: 3,
  };

  // --- Todo Today v2 ---
  board: TodoBoard | null = null;
  focus: TodoToday[] = [];
  overdue: TodoToday[] = [];
  backlogCount = 0;
  backlogItems: TodoToday[] = [];
  backlogOpen = false;
  softCap: TodoSoftCap | null = null;
  settingsOpen = false;

  // --- slice 7 / 10 ---
  stats: TodoBoardStats | null = null;
  triageOpen = false;
  triageMode: 'LEFTOVERS' | 'END_OF_DAY' = 'END_OF_DAY';
  triageItems: TodoToday[] = [];
  triageBusy = false;

  // Reward settings (stored locally)
  rewardSettings = {
    rewardFrom: 15,
    rewardTo: 30,
    rewardMultiplier: 1,
  };

  // Reward display states
  showReward = false;
  timerState: 'initial' | 'running' | 'paused' | 'minimized' = 'paused';
  rewardResult: number | null = null; // Temporary reward value before adding to bank

  // Timer properties
  timerInterval: any = null;
  savedRewardSeconds = 0;
  isMinimized = false;
  timerStartTimestamp: number | null = null; // Track when timer actually started
  timerInitialSeconds = 0; // Track initial time when timer started

  // Reward constraints
  readonly MAX_REWARD_MINUTES = this.getMaxRewardMinutes();
  readonly MAX_REWARD_SECONDS = this.MAX_REWARD_MINUTES * 60;

  // Year-end bonus period: 8 hours max until January 3, 2025
  private getMaxRewardMinutes(): number {
    const now = new Date();
    const yearEndDeadline = new Date('2025-01-03T00:00:00');

    if (now < yearEndDeadline) {
      return 480; // 8 hours during year-end period
    }
    return 180; // 3 hours normally
  }

  // TODO: Implement minimum usage requirement
  // Feature: Must use at least X minutes for dopamine release, otherwise system fails
  // Need to decide: What happens if minimum not met? Lose balance? Can't start? etc.
  readonly MIN_USAGE_MINUTES = 5; // Placeholder value

  // Backend sync
  syncInterval: any = null;
  lastSyncTime = 0;

  // Language-specific messages
  messages = {
    en: {
      noMatch: 'No matching todo found',
      statusUpdated: 'Todo status updated',
      updateFailed: 'Failed to update todo status',
      multipleMatches: 'Multiple matching todos found. Please be more specific',
      newTodoAdded: 'New todo added',
      addFailed: 'Failed to add new todo',
      languageChanged: 'Language changed to English',
      voiceError: 'Error with voice recognition: ',
      browserNotSupported: 'Voice recognition is not supported in your browser',
    },
    vi: {
      noMatch: 'Không tìm thấy công việc phù hợp',
      statusUpdated: 'Đã cập nhật trạng thái công việc',
      updateFailed: 'Không thể cập nhật trạng thái công việc',
      multipleMatches: 'Tìm thấy nhiều công việc phù hợp. Vui lòng nói rõ hơn',
      newTodoAdded: 'Đã thêm công việc mới',
      addFailed: 'Không thể thêm công việc mới',
      languageChanged: 'Đã chuyển sang tiếng Việt',
      voiceError: 'Lỗi nhận dạng giọng nói: ',
      browserNotSupported:
        'Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói',
    },
  };

  constructor(
    private todoTodayService: TodoTodayService,
    private todoLabelService: TodoLabelService,
    private alertService: AlertService,
    private userSettingsService: UserSettingsService,
    private userRewardService: UserRewardService,
    private todoRecurrenceService: TodoRecurrenceService,
    private dialog: MatDialog
  ) {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.setLanguage(this.currentLanguage);

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        this.processVoiceInput(transcript);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        this.alertService.showNoti(
          this.messages[this.currentLanguage].voiceError + event.error,
          'danger'
        );
      };
    }
  }

  ngOnInit() {
    this.loadRewardSettings();
    this.loadRewardState();
    this.searchToDoToDay();
  }

  ngOnDestroy() {
    this.stopTimerInterval();
    this.stopSyncInterval();
  }

  // Settings về cùng lượt gọi /board, nên không còn request riêng ở đây nữa —
  // đó là toàn bộ mục đích của endpoint board (§6.1).

  loadRewardSettings() {
    const saved = localStorage.getItem('todoRewardSettings');
    if (saved) {
      try {
        this.rewardSettings = JSON.parse(saved);
      } catch (e) {
        // If parsing fails, use defaults
      }
    }
  }

  updateRewardSettings() {
    localStorage.setItem(
      'todoRewardSettings',
      JSON.stringify(this.rewardSettings)
    );
  }

  updateSettings() {
    this.userSettingsService.updateTodoSettings(this.settings).subscribe(() => {
      this.alertService.showNoti('Settings updated', 'success');
    });
  }

  addToDoToDay() {
    const sample: TodoToday = {
      content: '',
      date: this.searchDate.value || new Date(),
    };
    this.isLoadingResults = true;
    this.todoTodayService.addTodoToday(sample).subscribe(
      (res: any) => {
        this.data.push(res);
        this.isLoadingResults = false;
      },
      err => {
        this.isLoadingResults = false;
      }
    );
  }

  addToDoToDayAtTop() {
    // Calculate order to be lower than the first item
    const firstItemOrder = this.data.length > 0 ? this.data[0].order || 0 : 0;
    const newOrder = firstItemOrder - 3;

    const sample: TodoToday = {
      content: '',
      date: this.searchDate.value || new Date(),
      order: newOrder,
    };
    this.isLoadingResults = true;
    this.todoTodayService.addTodoToday(sample).subscribe(
      (res: any) => {
        this.data.unshift(res);
        this.isLoadingResults = false;
      },
      err => {
        this.isLoadingResults = false;
      }
    );
  }

  async searchToDoToDay() {
    await this._getTodoLabel();
    await this._getMyToDoToDay();
  }

  _getTodoLabel() {
    this.isLoadingResults = true;
    this.todoLabelService.getTodoLabels().subscribe(
      (res: any) => {
        this.dataLabel = res;
        this.isLoadingResults = false;
      },
      err => {
        this.isLoadingResults = false;
      }
    );
  }

  /** 'YYYY-MM-DD' theo ngày đang xem trên thanh điều hướng. */
  private get boardDateKey(): string {
    const value = (this.searchDate && this.searchDate.value) || new Date();
    return dateFnsFormat.format(value, 'yyyy-MM-dd');
  }

  private decorate(todo: TodoToday): TodoToday {
    return {
      ...todo,
      checked: todo.status === TDTD_STATUS.DONE,
      todoLabel:
        todo.todoLabel && todo.todoLabel.length
          ? todo.todoLabel
          : // extractTodoLabel khai báo trả String[] (kiểu bọc) từ thời trước —
            // chuyển thật sang string[] thay vì ép kiểu cho qua mặt compiler.
            this.todoLabelService
              .extractTodoLabel(todo.content || '', this.dataLabel)
              .map(icon => String(icon)),
    };
  }

  /**
   * MỘT lượt gọi dựng cả màn hình (§6.1).
   *
   * Service mới KHÔNG nuốt lỗi (§D9), nên ở đây phải tự báo — trước kia lỗi
   * mạng hiện ra y hệt "hôm nay không có việc nào".
   */
  _getMyToDoToDay(timeout = 0) {
    this.isLoadingResults = true;
    this.todoTodayService.getBoard(this.boardDateKey).subscribe({
      next: (board: TodoBoard) => {
        this.board = board;
        this.settings = board.settings;
        this.softCap = board.softCap;
        this.focus = board.focus.map(el => this.decorate(el));
        this.overdue = board.overdue.map(el => this.decorate(el));
        this.backlogCount = board.backlog.count;
        this.backlogItems = board.backlog.items.map(el => this.decorate(el));
        this.data = board.today.map(el => this.decorate(el));
        this.isLoadingResults = false;
        this.loadStats();
        this.maybeOpenTriage();
      },
      error: () => {
        this.isLoadingResults = false;
        this.alertService.showNoti('Could not load the board', 'danger');
      },
    });
  }

  // ==========================================================================
  // Board v2 — dẫn xuất cho template
  // ==========================================================================

  /**
   * Danh sách hiển thị dưới Focus Bar.
   *
   * Ở chế độ mặc định (sắp theo weight) thì BỎ các việc đã nằm trên Focus Bar,
   * vì `focus` là tập con của `today` và render cả hai sẽ hiện việc số 1 hai
   * lần (§6.1). Ở chế độ kéo-thả thủ công thì render ĐỦ danh sách: việc trên
   * Focus Bar có thể nằm giữa danh sách, và bỏ nó đi sẽ làm chỉ số kéo-thả
   * lệch khỏi mảng thật.
   */
  get listItems(): TodoToday[] {
    if (!this.settings.sortByWeight) {
      return this.data;
    }
    const focusIds = new Set(this.focus.map(el => el.id));
    return this.data.filter(el => !focusIds.has(el.id));
  }

  /** Kéo-thả chỉ có nghĩa khi đang ở thứ tự thủ công. */
  get reorderable(): boolean {
    return !this.settings.sortByWeight;
  }

  get openCount(): number {
    return this.data.filter(el => el.status !== TDTD_STATUS.DONE).length;
  }

  get doneCount(): number {
    return this.data.filter(el => el.status === TDTD_STATUS.DONE).length;
  }

  private indexOfTodo(todo: TodoToday): number {
    return this.data.findIndex(el => el.id === todo.id);
  }

  /** Sắp lại tại chỗ để danh sách không nhảy khác ở lần tải kế tiếp. */
  private resort(): void {
    this.data = sortTodos(this.data, this.settings.sortByWeight);
    this.focus = sortTodos(
      this.data.filter(el => el.status !== TDTD_STATUS.DONE),
      true
    ).slice(0, this.settings.focusCount || 1);
  }

  onToggle(todo: TodoToday): void {
    const index = this.indexOfTodo(todo);
    if (index === -1) return;
    this.updateStatus(this.data[index], index);
  }

  onContentChange(todo: TodoToday): void {
    const index = this.indexOfTodo(todo);
    if (index === -1) return;
    this.saveItem(todo.id!, this.data[index], index);
  }

  onWeightChange(event: { todo: TodoToday; weight: number }): void {
    const index = this.indexOfTodo(event.todo);
    if (index === -1) return;
    const previous = effectiveWeight(this.data[index]);

    // Cập nhật lạc quan rồi sắp lại ngay: đổi weight mà danh sách đứng yên
    // tới lượt tải sau thì thao tác trông như không có tác dụng.
    this.data[index] = { ...this.data[index], weight: event.weight };
    this.resort();

    this.todoTodayService.setWeight(event.todo.id!, event.weight).subscribe({
      next: (res: TodoToday) => {
        const at = this.indexOfTodo(res);
        if (at !== -1) this.data[at] = this.decorate(res);
        this.resort();
      },
      error: () => {
        const at = this.indexOfTodo(event.todo);
        if (at !== -1) this.data[at] = { ...this.data[at], weight: previous };
        this.resort();
        this.alertService.showNoti('Could not change weight', 'danger');
      },
    });
  }

  onDeferTomorrow(todo: TodoToday): void {
    this.deferTodo(todo, { to: 'TOMORROW' });
  }

  onSendToBacklog(todo: TodoToday): void {
    this.deferTodo(todo, { to: 'BACKLOG' });
  }

  private deferTodo(
    todo: TodoToday,
    payload: { to: 'TOMORROW' | 'DATE' | 'BACKLOG'; date?: string }
  ): void {
    this.isLoadingResults = true;
    this.todoTodayService.defer(todo.id!, payload).subscribe({
      next: (res: TodoToday) => {
        this.isLoadingResults = false;
        // Việc đã rời khỏi ngày đang xem.
        this.data = this.data.filter(el => el.id !== todo.id);
        if (res.bucket === 'BACKLOG') this.backlogCount += 1;
        this.resort();

        // Nói rõ LÝ DO khi server tự đẩy vào backlog, thay vì để việc lặng lẽ
        // biến mất khỏi hôm nay (§6.2).
        if (res.autoBacklogged) {
          this.alertService.showNoti(
            `Deferred ${res.deferCount} times — moved to backlog and lowered to weight ${res.weight}`,
            'warning'
          );
        } else {
          this.alertService.showNoti(
            payload.to === 'BACKLOG' ? 'Moved to backlog' : 'Moved to tomorrow',
            'success'
          );
        }
      },
      error: () => {
        this.isLoadingResults = false;
        this.alertService.showNoti('Could not defer this task', 'danger');
      },
    });
  }

  onReorder(event: CdkDragDrop<TodoToday[]>): void {
    this.drop(event);
  }

  openSettings(): void {
    this.settingsOpen = true;
  }

  closeSettings(): void {
    this.settingsOpen = false;
  }

  onSettingsChanged(settings: UserTodoSettings): void {
    this.settings = settings;
    this.updateSettings();
    this.resort();
  }
  setChangedLineOnly(res: TodoToday, index: number) {
    this.data[index] = { ...res, checked: res.status === TDTD_STATUS.DONE };
  }
  updateStatus(item: TodoToday, index: number) {
    const req = {
      ...item,
      status: toggleStatus(item.status!),
    };
    this.isLoadingResults = true;
    this.todoTodayService.updateTodoToday(item.id!, req).subscribe({
      next: (res: any) => {
        this.setChangedLineOnly(res, index);
        this.isLoadingResults = false;
      },
      error: () => {
        this.isLoadingResults = false;
      },
    });
  }
  saveItem(id: number, item: TodoToday, index: number) {
    item.content = item.content?.trim();
    this.todoTodayService.updateTodoToday(id, item).subscribe(
      (res: any) => {
        this.setChangedLineOnly(res, index);
      },
      err => {}
    );
  }
  delete(id: number) {
    if (!this.data || !this.data.length) {
      return;
    }
    if (id) {
      this.isLoadingResults = true;
      this.todoTodayService.deleteTodoToday(id).subscribe(
        (_: any) => {
          this.data = this.data.filter(el => el.id !== id);
          this.isLoadingResults = false;
        },
        err => {
          this.isLoadingResults = false;
        }
      );
    }
  }
  increaseCount() {
    this.count++;
    if (this.count >= 5) {
      this.count = 0;
      this.triggerJobManually();
    }
  }
  triggerJobManually() {
    // no need trigger job manually
  }
  deleteTDTD(tdtd: TodoToday) {
    const val = confirm(`Delete "${tdtd.content}"?`);
    if (val) {
      this.delete(tdtd.id!);
    }
  }
  async drop(event: CdkDragDrop<TodoToday[]>) {
    const result = await this.sort(event.previousIndex, event.currentIndex);
    if (result === 'fail') {
      this.alertService.showNoti('Sort Fail!', 'danger');
      return;
    }
    moveItemInArray(this.data, event.previousIndex, event.currentIndex);
  }

  /**
   * Advanced ordering system using fractional positioning
   * This allows unlimited reordering without order conflicts
   */
  sort(preIndex: number, curIndex: number) {
    const item = this.data[preIndex];
    let newOrder: number;

    if (curIndex === 0) {
      // Moving to first position
      const firstOrder = this.data[0].order || 0;
      newOrder = firstOrder - 1;
    } else if (curIndex === this.data.length - 1) {
      // Moving to last position
      const lastOrder = this.data[this.data.length - 1].order || 0;
      newOrder = lastOrder + 1;
    } else {
      // Moving between two items - use fractional positioning
      const prevOrder = this.data[curIndex - 1].order || 0;
      const nextOrder = this.data[curIndex].order || 0;

      // Calculate midpoint between previous and next
      newOrder = (Number(prevOrder) + Number(nextOrder)) / 2;

      // If the difference is too small, we need to rebalance all orders
      if (Math.abs(nextOrder - prevOrder) < 0.000001) {
        return this.rebalanceOrders(preIndex, curIndex);
      }
    }

    return new Promise<any>((resolve, reject) => {
      const req = {
        ...item,
        order: newOrder,
      };
      this.todoTodayService.updateTodoToday(item.id!, req).subscribe({
        next: () => {
          this.isLoadingResults = false;
          resolve('success');
        },
        error: () => {
          this.isLoadingResults = false;
          reject('fail');
        },
      });
    });
  }

  /**
   * Rebalance all order values when fractional precision runs out
   * This ensures we can always continue reordering
   */
  async rebalanceOrders(preIndex: number, curIndex: number): Promise<string> {
    try {
      // Create a copy and move the item
      const tempData = [...this.data];
      moveItemInArray(tempData, preIndex, curIndex);

      // Assign new sequential orders with spacing
      const updates = tempData.map((item, index) => ({
        id: item.id,
        order: index * 10,
      }));

      // Update all items on the server
      for (const update of updates) {
        await this.todoTodayService
          .updateTodoToday(update.id!, { order: update.order })
          .toPromise();
      }

      // Update local data orders
      tempData.forEach((item, index) => {
        item.order = index * 10;
      });

      return 'success';
    } catch (err) {
      return 'fail';
    }
  }
  increaseDate() {
    const val = dateFns.addDays(this.searchDate.value, 1);
    this.searchDate.setValue(val);
  }
  decreaseDate() {
    const val = dateFns.addDays(this.searchDate.value, -1);
    this.searchDate.setValue(val);
  }
  increaseStatus() {
    this.searchStatus = this.nextStatus(this.searchStatus!);
  }
  decreaseStatus() {
    this.searchStatus = this.previousStatus(this.searchStatus!);
  }

  setLanguage(lang: 'en' | 'vi') {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang === 'en' ? 'en-US' : 'vi-VN';
    }
  }

  processVoiceInput(transcript: string) {
    this.showTranscript = transcript;
    // Handle language change commands
    if (transcript.includes('set language to')) {
      if (transcript.includes('english')) {
        this.setLanguage('en');
        this.alertService.showNoti(this.messages.en.languageChanged, 'success');
        return;
      } else if (
        transcript.includes('vietnamese') ||
        transcript.includes('vietnam')
      ) {
        this.setLanguage('vi');
        this.alertService.showNoti(this.messages.vi.languageChanged, 'success');
        return;
      }
    }

    // Split the transcript into words
    const words = transcript.split(' ');
    const firstWord = words[0].toLowerCase();
    const content = words.slice(1).join(' ');

    // Check if it's a status update command
    const allKeywords = [...this.statusKeywords];
    // console.log('dangth, firstWord', firstWord);
    // console.log('dangth, allKeywords', allKeywords);
    // console.log('dangth, FINISH_WORDS', FINISH_WORDS);
    // console.log('dangth, IN_PROGRESS_WORDS', IN_PROGRESS_WORDS);
    // console.log('dangth, INPUT_WORDS', INPUT_WORDS);
    // console.log('dangth, content', content);
    if (allKeywords.includes(firstWord)) {
      if (FINISH_WORDS.includes(firstWord)) {
        this.updateTodoStatus(content, TDTD_STATUS.DONE);
      } else if (IN_PROGRESS_WORDS.includes(firstWord)) {
        this.updateTodoStatus(content, TDTD_STATUS.NEW);
      } else if (INPUT_WORDS.includes(firstWord)) {
        this.addNewTodo(content);
      }
    } else {
      // If no status keyword is found, treat it as a new todo
      this.addNewTodo(transcript);
    }
  }

  updateTodoStatus(content: string, newStatus: string) {
    console.log('dangth, content', content, newStatus);
    const matchingTodos = this.data.filter(todo => {
      if (!todo.content) return false;
      const similarity = calculateSimilarity(content, todo.content);
      return similarity >= SIMILARITY_THRESHOLD;
    });

    if (matchingTodos.length === 0) {
      this.alertService.showNoti(
        this.messages[this.currentLanguage].noMatch,
        'warning'
      );
    } else if (matchingTodos.length === 1) {
      const todo = matchingTodos[0];
      const index = this.data.findIndex(t => t.id === todo.id);
      if (index !== -1) {
        const updatedTodo = { ...todo, status: newStatus };
        this.todoTodayService.updateTodoToday(todo.id!, updatedTodo).subscribe(
          (res: any) => {
            this.setChangedLineOnly(res, index);
            this.alertService.showNoti(
              this.messages[this.currentLanguage].statusUpdated,
              'success'
            );
          },
          err => {
            this.alertService.showNoti(
              this.messages[this.currentLanguage].updateFailed,
              'danger'
            );
          }
        );
      }
    } else {
      this.alertService.showNoti(
        this.messages[this.currentLanguage].multipleMatches,
        'warning'
      );
    }
  }

  addNewTodo(content: string) {
    const newTodo: TodoToday = {
      content: content,
      status: TDTD_STATUS.NEW,
      date: this.searchDate.value || new Date(),
    };

    this.todoTodayService.addTodoToday(newTodo).subscribe(
      (res: any) => {
        this.data.push(res);
        this.alertService.showNoti(
          this.messages[this.currentLanguage].newTodoAdded,
          'success'
        );
      },
      err => {
        this.alertService.showNoti(
          this.messages[this.currentLanguage].addFailed,
          'danger'
        );
      }
    );
  }

  toggleVoiceRecognition() {
    if (!this.recognition) {
      this.alertService.showNoti(
        this.messages[this.currentLanguage].browserNotSupported,
        'warning'
      );
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.isListening = true;
      this.recognition.start();
    }
  }

  toggleSearchForm() {
    this.isSearchFormExpanded = !this.isSearchFormExpanded;
  }

  // ============== REWARD & TIMER METHODS ==============

  generateReward() {
    const { rewardFrom, rewardTo, rewardMultiplier } = this.rewardSettings;

    // Validate inputs
    if (rewardFrom > rewardTo) {
      this.alertService.showNoti(
        'Reward From must be less than or equal to Reward To',
        'warning'
      );
      return;
    }

    // Generate random integer between from and to (inclusive)
    const randomValue =
      Math.floor(Math.random() * (rewardTo - rewardFrom + 1)) + rewardFrom;

    // Multiply by the multiplier (result in minutes)
    const rewardMinutes = randomValue * rewardMultiplier;
    this.rewardResult = rewardMinutes;

    // Show beautiful popup with reward
    this.showReward = true;
    this.timerState = 'initial';
    this.isMinimized = false;
  }

  addRewardToBank() {
    if (!this.rewardResult) return;

    const rewardSeconds = Math.floor(this.rewardResult * 60);
    const newTotal = this.savedRewardSeconds + rewardSeconds;

    // Apply max cap (180 minutes)
    if (newTotal > this.MAX_REWARD_SECONDS) {
      const overflow = Math.floor((newTotal - this.MAX_REWARD_SECONDS) / 60);
      this.savedRewardSeconds = this.MAX_REWARD_SECONDS;

      this.alertService.showNoti(
        `🎁 Added ${this.rewardResult} minutes! ⚠️ Cap reached (${this.MAX_REWARD_MINUTES}m max). Lost ${overflow} minutes of overflow.`,
        'warning'
      );
    } else {
      this.savedRewardSeconds = newTotal;

      this.alertService.showNoti(
        `🎁 Added ${this.rewardResult} minutes to your reward bank!`,
        'success'
      );
    }

    // Sync to backend
    this.syncToBackend();

    // Close popup
    this.showReward = false;
    this.rewardResult = null;
  }

  addManualMinutes() {
    const MANUAL_MINUTES = 10;
    const manualSeconds = MANUAL_MINUTES * 60;
    const newTotal = this.savedRewardSeconds + manualSeconds;

    // Apply max cap
    if (newTotal > this.MAX_REWARD_SECONDS) {
      const overflow = Math.floor((newTotal - this.MAX_REWARD_SECONDS) / 60);
      this.savedRewardSeconds = this.MAX_REWARD_SECONDS;

      this.alertService.showNoti(
        `➕ Added ${MANUAL_MINUTES} minutes! ⚠️ Cap reached (${this.MAX_REWARD_MINUTES}m max). Lost ${overflow} minutes of overflow.`,
        'warning'
      );
    } else {
      this.savedRewardSeconds = newTotal;

      this.alertService.showNoti(
        `➕ Added ${MANUAL_MINUTES} minutes to your reward bank!`,
        'success'
      );
    }

    // Sync to backend
    this.syncToBackend();
  }

  minusManualMinutes() {
    const MANUAL_MINUTES = -10;
    const manualSeconds = MANUAL_MINUTES * 60;
    const newTotal = this.savedRewardSeconds + manualSeconds;

    // Apply max cap
    if (newTotal <= 0) {
      this.savedRewardSeconds = 0;

      this.alertService.showNoti(
        `➖ Minused ${MANUAL_MINUTES} minutes! ⚠️ Cap reached (0m min)`,
        'warning'
      );
    } else {
      this.savedRewardSeconds = newTotal;

      this.alertService.showNoti(
        `➖ Minused ${MANUAL_MINUTES} minutes to your reward bank!`,
        'success'
      );
    }

    // Sync to backend
    this.syncToBackend();
  }

  cancelReward() {
    this.showReward = false;
    this.rewardResult = null;
  }

  openTimerFromSavedReward() {
    if (this.savedRewardSeconds <= 0) {
      this.alertService.showNoti('No saved reward time available', 'warning');
      return;
    }

    // Open timer overlay in paused state
    this.showReward = true;
    this.timerState = 'paused';
    this.isMinimized = false;
  }

  startTimer() {
    if (this.savedRewardSeconds <= 0) {
      this.alertService.showNoti('No reward time available', 'warning');
      return;
    }

    this.timerState = 'running';
    this.timerStartTimestamp = Date.now();
    this.timerInitialSeconds = this.savedRewardSeconds;
    this.startTimerInterval();
    this.startSyncInterval();
    this.syncToBackend();
  }

  pauseTimer() {
    this.timerState = 'paused';
    this.timerStartTimestamp = null;
    this.stopTimerInterval();
    this.syncToBackend();
  }

  resumeTimer() {
    this.timerState = 'running';
    this.timerStartTimestamp = Date.now();
    this.timerInitialSeconds = this.savedRewardSeconds;
    this.startTimerInterval();
    this.syncToBackend();
  }

  stopTimer() {
    // Stop the timer (time is already in savedRewardSeconds)
    this.timerState = 'paused';
    this.showReward = false;
    this.isMinimized = false;

    this.stopTimerInterval();
    this.syncToBackend();

    const remainingMinutes = Math.floor(this.savedRewardSeconds / 60);
    this.alertService.showNoti(
      `Timer stopped. ${remainingMinutes} minutes remain in your bank.`,
      'info'
    );
  }

  minimizeTimer() {
    this.isMinimized = true;
    this.timerState = 'minimized';
    this.showReward = false;
  }

  expandTimer() {
    this.isMinimized = false;
    if (this.savedRewardSeconds > 0) {
      this.timerState = this.timerInterval ? 'running' : 'paused';
      this.showReward = true;
    }
  }

  closeReward() {
    if (this.timerState === 'initial') {
      // Cancel adding reward
      this.cancelReward();
    } else if (this.timerState === 'running' || this.timerState === 'paused') {
      this.minimizeTimer();
    } else {
      this.showReward = false;
    }
  }

  // ============== TIMER INTERVAL ==============

  startTimerInterval() {
    this.stopTimerInterval();
    this.timerInterval = setInterval(() => {
      if (this.timerStartTimestamp && this.savedRewardSeconds > 0) {
        // Calculate actual elapsed time since timer started
        const elapsedMs = Date.now() - this.timerStartTimestamp;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);

        // Calculate remaining time based on actual elapsed time
        const newRemainingSeconds = Math.max(
          0,
          this.timerInitialSeconds - elapsedSeconds
        );

        // Update saved reward seconds
        this.savedRewardSeconds = newRemainingSeconds;

        // Sync every 30 seconds
        const now = Date.now();
        if (now - this.lastSyncTime > 30000) {
          this.syncToBackend();
        }

        // Timer completed
        if (this.savedRewardSeconds === 0) {
          this.onTimerComplete();
        }
      }
    }, 1000);
  }

  stopTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onTimerComplete() {
    this.stopTimerInterval();
    this.timerState = 'paused';
    this.showReward = false;
    this.isMinimized = false;
    this.timerStartTimestamp = null;

    this.syncToBackend();
    this.alertService.showNoti(
      '⏰ Timer complete! Time to get back to work! 🎉',
      'success'
    );
  }

  // ============== SYNC & STATE MANAGEMENT ==============

  loadRewardState() {
    this.userRewardService.getRewardState().subscribe((state: any) => {
      if (state) {
        // Load saved reward (the bank)
        const savedReward = state.savedReward || 0;

        // Check if timer was running
        if (
          state.activeTimer &&
          !state.activeTimer.isPaused &&
          state.activeTimer.startTime
        ) {
          // Calculate time elapsed since last sync
          const elapsed = Math.floor(
            (Date.now() - new Date(state.activeTimer.startTime).getTime()) /
              1000
          );
          const timeUsed = Math.min(elapsed, savedReward);

          // Update saved reward (deduct elapsed time)
          this.savedRewardSeconds = Math.max(0, savedReward - timeUsed);

          // Resume timer if there's time left
          if (this.savedRewardSeconds > 0) {
            this.timerState = 'running';
            this.isMinimized = true;
            this.startTimerInterval();
            this.startSyncInterval();
          }
        } else {
          // Timer was paused or not running
          this.savedRewardSeconds = savedReward;

          // Show minimized badge if there was an active timer
          if (
            state.activeTimer &&
            state.activeTimer.isPaused &&
            savedReward > 0
          ) {
            this.timerState = 'paused';
            this.isMinimized = true;
          }
        }
      }
    });
  }

  syncToBackend() {
    this.lastSyncTime = Date.now();

    const state = {
      activeTimer: {
        totalSeconds: this.savedRewardSeconds, // Total is same as remaining (from bank)
        remainingSeconds: this.savedRewardSeconds,
        isPaused:
          this.timerState === 'paused' || this.timerState === 'minimized',
        startTime: this.timerState === 'running' ? new Date() : null,
      },
      savedReward: this.savedRewardSeconds,
    };

    this.userRewardService.updateRewardState(state).subscribe();

    // Also backup to localStorage
    localStorage.setItem('rewardState', JSON.stringify(state));
  }

  startSyncInterval() {
    this.stopSyncInterval();
    // Sync every 30 seconds when timer is running
    this.syncInterval = setInterval(() => {
      if (this.timerState === 'running') {
        this.syncToBackend();
      }
    }, 30000);
  }

  stopSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ============== UTILITY METHODS ==============

  getTimerDisplay(): string {
    const minutes = Math.floor(this.savedRewardSeconds / 60);
    const seconds = this.savedRewardSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getSavedRewardDisplay(): string {
    const minutes = Math.floor(this.savedRewardSeconds / 60);
    return `${minutes}`;
  }

  // ==========================================================================
  // Slice 10 — số liệu cho widget
  // ==========================================================================

  loadStats(): void {
    // Gọi RIÊNG khỏi /board: đây là truy vấn nặng hơn nhiều và màn hình vẽ
    // được mà chưa cần nó.
    this.todoTodayService.getStats(4).subscribe({
      next: stats => (this.stats = stats),
      error: () => (this.stats = null),
    });
  }

  get office() {
    return this.stats?.office || null;
  }

  get staleGroups(): string[] {
    return this.stats?.workout?.staleGroups || [];
  }

  /** Thêm MỘT ngày office do chủ nhân chọn. Hệ thống không tự bịa ngày (§9.3). */
  addOfficeDay(dateValue: string): void {
    if (!dateValue) return;
    this.todoTodayService
      .addTodoToday({
        content: '🏢 Lên công ty',
        date: dateValue as unknown as Date,
        weight: 4,
        meta: { kind: 'OFFICE' },
      })
      .subscribe(() => {
        this.alertService.showNoti('Office day added', 'success');
        this.searchToDoToDay();
      });
  }

  // ==========================================================================
  // Slice 7 — bảng triage cuối ngày
  // ==========================================================================

  private triageStorageKey(): string {
    return `todoTriage:${this.board?.date || ''}`;
  }

  /**
   * Mở bảng theo §10.5:
   *  1. có việc quá hạn -> mở ngay ở chế độ "Leftovers"
   *  2. đã tới giờ endOfDayHour và còn việc mở -> mở "End of day", MỘT LẦN/ngày
   *
   * Đây là lời nhắc, không phải khoá: đóng được và có nhớ đã hỏi.
   */
  maybeOpenTriage(): void {
    if (this.triageOpen) return;

    if (this.overdue.length) {
      this.triageMode = 'LEFTOVERS';
      this.triageItems = this.overdue;
      this.triageOpen = true;
      return;
    }

    const hour = new Date().getHours();
    if (hour < (this.settings.endOfDayHour || 20)) return;
    if (!this.openCount) return;

    try {
      if (localStorage.getItem(this.triageStorageKey())) return;
      localStorage.setItem(this.triageStorageKey(), '1');
    } catch {
      // Trình duyệt chặn storage thì vẫn mở — mất khả năng nhớ, không mất
      // tính năng.
    }

    this.triageMode = 'END_OF_DAY';
    this.triageItems = this.data.filter(el => el.status !== TDTD_STATUS.DONE);
    this.triageOpen = true;
  }

  openTriage(): void {
    this.triageBusy = true;
    this.todoTodayService.getTriage(this.board?.date).subscribe({
      next: view => {
        this.triageBusy = false;
        this.triageMode = 'END_OF_DAY';
        this.triageItems = view.items;
        this.triageOpen = true;
      },
      error: () => {
        this.triageBusy = false;
        this.alertService.showNoti('Could not load the triage list', 'danger');
      },
    });
  }

  closeTriage(): void {
    this.triageOpen = false;
  }

  submitTriage(decisions: TriageDecision[]): void {
    if (!decisions.length) {
      this.triageOpen = false;
      return;
    }
    this.triageBusy = true;
    this.todoTodayService
      .submitTriage({ date: this.board?.date || '', decisions })
      .subscribe({
        next: result => {
          this.triageBusy = false;
          this.triageOpen = false;
          const failed = result.results.filter(r => !r.ok);
          // Báo cả phần hỏng: lô vẫn áp dụng được phần lành, và im lặng nuốt
          // vài dòng lỗi là cách nhanh nhất để mất niềm tin vào bảng này.
          if (failed.length) {
            this.alertService.showNoti(
              `Applied ${result.applied}, ${failed.length} failed`,
              'warning'
            );
          } else {
            this.alertService.showNoti(
              `Applied ${result.applied} decision(s)`,
              'success'
            );
          }
          this.searchToDoToDay();
        },
        error: () => {
          this.triageBusy = false;
          this.alertService.showNoti('Triage failed', 'danger');
        },
      });
  }

  // ==========================================================================
  // Slice 7 — lịch lặp
  // ==========================================================================

  openRecurrenceDialog(recurrence?: TodoRecurrence): void {
    const ref = this.dialog.open(TodoRecurrenceDialogComponent, {
      data: { recurrence },
      width: '560px',
      maxWidth: '100vw',
      panelClass: 'todo-sheet-dialog',
    });

    ref.afterClosed().subscribe((result?: TodoRecurrence) => {
      if (!result) return;
      const request = result._id
        ? this.todoRecurrenceService.update(result._id, result)
        : this.todoRecurrenceService.create(result);

      request.subscribe({
        next: () => {
          this.alertService.showNoti('Repeat saved', 'success');
          this.searchToDoToDay();
        },
        error: err => {
          // Server đặt tên trường trong thông báo lỗi để hiện thẳng ra đây.
          this.alertService.showNoti(
            err?.error?.msg || 'Could not save the repeat',
            'danger'
          );
        },
      });
    });
  }

  /**
   * "Chuyển thành lịch lặp" cho việc còn sót marker `[loop…]` chưa migrate —
   * mở sẵn hộp thoại với tiêu đề đã làm sạch, thay vì bắt sửa chuỗi bằng tay.
   */
  convertToRecurrence(todo: TodoToday): void {
    const title = (todo.content || '')
      .replace(/\[loop[^\]]*\]/i, ' ')
      .replace(/#\d+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const draft = { ...new TodoRecurrence(), title, weight: todo.weight || 3 };
    draft.pattern = { type: 'DAILY' };
    this.openRecurrenceDialog(draft);
  }

  hasLegacyMarker(todo: TodoToday): boolean {
    return /\[loop/i.test(todo.content || '');
  }

  get legacyTodos(): TodoToday[] {
    return this.data.filter(el => this.hasLegacyMarker(el));
  }

  /** Chip quick-add: recurrence thì spawn, nội dung hay gõ thì tạo việc mới. */
  useQuickAdd(chip: {
    recurrenceId?: string;
    title: string;
    weight: number;
  }): void {
    const request = chip.recurrenceId
      ? this.todoRecurrenceService.spawn(chip.recurrenceId)
      : this.todoTodayService.addTodoToday({
          content: chip.title,
          weight: chip.weight,
          date: this.searchDate.value || new Date(),
        });

    request.subscribe({
      next: () => this.searchToDoToDay(),
      error: () =>
        this.alertService.showNoti('Could not add that task', 'danger'),
    });
  }

  // ==========================================================================
  // Backlog — xem và kéo việc trở lại lịch
  // ==========================================================================

  toggleBacklog(): void {
    this.backlogOpen = !this.backlogOpen;
    // /board chỉ trả 20 dòng đầu; mở panel ra thì lấy đủ.
    if (this.backlogOpen && this.backlogItems.length < this.backlogCount) {
      this.loadBacklog();
    }
  }

  loadBacklog(): void {
    this.todoTodayService.getBacklog(100, 0).subscribe({
      next: page => {
        this.backlogItems = page.items.map(el => this.decorate(el));
        this.backlogCount = page.count;
      },
      error: () =>
        this.alertService.showNoti('Could not load the backlog', 'danger'),
    });
  }

  /** Kéo một việc từ backlog trở lại ngày đang xem. */
  scheduleFromBacklog(todo: TodoToday, dateValue?: string): void {
    const date = dateValue || this.boardDateKey;
    this.todoTodayService.schedule(todo.id!, date).subscribe({
      next: () => {
        this.backlogItems = this.backlogItems.filter(el => el.id !== todo.id);
        this.backlogCount = Math.max(0, this.backlogCount - 1);
        this.alertService.showNoti(`Scheduled for ${date}`, 'success');
        this.searchToDoToDay();
      },
      error: () =>
        this.alertService.showNoti('Could not schedule that task', 'danger'),
    });
  }

  deleteFromBacklog(todo: TodoToday): void {
    if (!confirm(`Delete "${todo.content}"?`)) return;
    this.todoTodayService.deleteTodoToday(todo.id!).subscribe(() => {
      this.backlogItems = this.backlogItems.filter(el => el.id !== todo.id);
      this.backlogCount = Math.max(0, this.backlogCount - 1);
    });
  }
}
