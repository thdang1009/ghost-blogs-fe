import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { TodoLabel, TodoToday } from '@models/_index';
import * as dateFns from 'date-fns';
import {
  AlertService,
  TodoLabelService,
  TodoTodayService,
  UserSettingsService,
  UserRewardService,
} from '@services/_index';
import {
  isImportant,
  nextStatus,
  previousStatus,
  toggleStatus,
  calculateSimilarity,
} from '@shared/common';
import { TDTD_STATUS } from '@shared/enum';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

const SIMILARITY_THRESHOLD = 80; // 80% similarity threshold
const FINISH_WORDS = ['done', 'xong', 'finish', 'completed', 'đã'];
const INPUT_WORDS = ['add', 'new', 'thêm', 'mới', 'tạo'];
const IN_PROGRESS_WORDS = ['progress', 'đang', 'chưa'];
const ENUM_CATEGORY = {
  TODAY: 'TODAY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  PARKING_LOT: 'PARKING_LOT',
};
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

  // Category settings
  settings = {
    todayCount: 3,
    weeklyCount: 5,
    monthlyCount: 2,
  };

  // Reward settings (stored locally)
  rewardSettings = {
    rewardFrom: 15,
    rewardTo: 30,
    rewardMultiplier: 1,
  };

  // Reward display states
  showReward = false;
  timerState: 'running' | 'paused' | 'minimized' = 'paused';

  // Timer properties
  timerInterval: any = null;
  savedRewardSeconds = 0;
  isMinimized = false;

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
    private userRewardService: UserRewardService
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
    this.loadSettings();
    this.loadRewardSettings();
    this.loadRewardState();
    this.searchToDoToDay();
  }

  ngOnDestroy() {
    this.stopTimerInterval();
    this.stopSyncInterval();
  }

  loadSettings() {
    this.userSettingsService.getTodoSettings().subscribe((settings: any) => {
      if (settings) {
        this.settings = {
          todayCount: settings.todayCount,
          weeklyCount: settings.weeklyCount,
          monthlyCount: settings.monthlyCount,
        };
      }
    });
  }

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
    localStorage.setItem('todoRewardSettings', JSON.stringify(this.rewardSettings));
  }

  updateSettings() {
    this.userSettingsService.updateTodoSettings(this.settings).subscribe(() => {
      this.alertService.showNoti('Settings updated', 'success');
    });
  }

  getCategoryForIndex(index: number): string {
    const { todayCount, weeklyCount, monthlyCount } = this.settings;

    if (index < todayCount) return ENUM_CATEGORY.TODAY;
    if (index < todayCount + weeklyCount) return ENUM_CATEGORY.WEEKLY;
    if (index < todayCount + weeklyCount + monthlyCount)
      return ENUM_CATEGORY.MONTHLY;
    return ENUM_CATEGORY.PARKING_LOT;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      [ENUM_CATEGORY.TODAY]: '#E7FAFD', // '#FAF5EE',
      [ENUM_CATEGORY.WEEKLY]: '#f7fdff', // '#fff6e6',
      [ENUM_CATEGORY.MONTHLY]: '#DFEAF2', //'#f7f1df',
      [ENUM_CATEGORY.PARKING_LOT]: '#FFFFFF',
    };
    return colors[category] || '#FFFFFF';
  }

  getTaskCategory(task: TodoToday): string {
    const index = this.data.indexOf(task);
    return this.getCategoryForIndex(index);
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
    const firstItemOrder = this.data.length > 0 ? (this.data[0].order || 0) : 0;
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

  _getMyToDoToDay(timeout = 0) {
    const value = (this.searchDate && this.searchDate.value) || new Date();
    const fromDate = dateFns.startOfDay(value);
    const toDate = dateFns.endOfDay(value);
    const req = {
      from: fromDate || undefined,
      to: toDate || undefined,
      status: this.searchStatus === 'NONE' ? undefined : this.searchStatus,
    };
    this.isLoadingResults = true;
    this.todoTodayService.getMyTodoToday(req).subscribe(
      (res: any) => {
        this.data = res
          .map((el: TodoToday) => {
            return {
              ...el,
              checked: el.status === TDTD_STATUS.DONE,
              todoLabel:
                el.todoLabel && el.todoLabel.length
                  ? el.todoLabel
                  : this.todoLabelService.extractTodoLabel(
                      el.content!,
                      this.dataLabel
                    ),
            };
          })
          .sort((a: TodoToday, b: TodoToday) => (a.order || 0) - (b.order || 0));
        console.log('dangth, data', this.data);
        this.isLoadingResults = false;
      },
      err => {
        this.isLoadingResults = false;
      }
    );
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
    this.todoTodayService.updateTodoToday(item.id, req).subscribe(
      (res: any) => {
        this.setChangedLineOnly(res, index);
        this.isLoadingResults = false;
      },
      err => {
        this.isLoadingResults = false;
      }
    );
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
  async drop(event: CdkDragDrop<string[]>) {
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
      this.todoTodayService.updateTodoToday(item.id, req).subscribe(
        (_: any) => {
          this.isLoadingResults = false;
          resolve('success');
        },
        err => {
          this.isLoadingResults = false;
          reject('fail');
        }
      );
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
          .updateTodoToday(update.id, { order: update.order })
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
      this.alertService.showNoti('Reward From must be less than or equal to Reward To', 'warning');
      return;
    }

    // Generate random integer between from and to (inclusive)
    const randomValue = Math.floor(Math.random() * (rewardTo - rewardFrom + 1)) + rewardFrom;

    // Multiply by the multiplier (result in minutes, convert to seconds)
    const rewardMinutes = randomValue * rewardMultiplier;
    const rewardSeconds = Math.floor(rewardMinutes * 60);

    // Add directly to saved bank
    this.savedRewardSeconds += rewardSeconds;

    // Sync to backend
    this.syncToBackend();

    // Show success notification
    this.alertService.showNoti(
      `🎁 Added ${rewardMinutes} minutes to your reward bank!`,
      'success'
    );
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
    this.startTimerInterval();
    this.startSyncInterval();
    this.syncToBackend();
  }

  pauseTimer() {
    this.timerState = 'paused';
    this.stopTimerInterval();
    this.syncToBackend();
  }

  resumeTimer() {
    this.timerState = 'running';
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
    this.alertService.showNoti(`Timer stopped. ${remainingMinutes} minutes remain in your bank.`, 'info');
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
    if (this.timerState === 'running' || this.timerState === 'paused') {
      this.minimizeTimer();
    } else {
      this.showReward = false;
    }
  }

  // ============== TIMER INTERVAL ==============

  startTimerInterval() {
    this.stopTimerInterval();
    this.timerInterval = setInterval(() => {
      if (this.savedRewardSeconds > 0) {
        this.savedRewardSeconds--;

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

    this.syncToBackend();
    this.alertService.showNoti('⏰ Timer complete! Time to get back to work! 🎉', 'success');
  }

  // ============== SYNC & STATE MANAGEMENT ==============

  loadRewardState() {
    this.userRewardService.getRewardState().subscribe((state: any) => {
      if (state) {
        // Load saved reward (the bank)
        const savedReward = state.savedReward || 0;

        // Check if timer was running
        if (state.activeTimer && !state.activeTimer.isPaused && state.activeTimer.startTime) {
          // Calculate time elapsed since last sync
          const elapsed = Math.floor((Date.now() - new Date(state.activeTimer.startTime).getTime()) / 1000);
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
          if (state.activeTimer && state.activeTimer.isPaused && savedReward > 0) {
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
        isPaused: this.timerState === 'paused' || this.timerState === 'minimized',
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
}
