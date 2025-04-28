import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { TodoLabel, TodoToday } from '@models/_index';
import * as dateFns from 'date-fns';
import { AlertService, TodoLabelService, TodoTodayService } from '@services/_index';
import { isImportant, nextStatus, previousStatus, toggleStatus, calculateSimilarity } from '@shared/common';
import { TDTD_STATUS } from '@shared/enum';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

const SIMILARITY_THRESHOLD = 80; // 80% similarity threshold
const FINISH_WORDS = ['done', 'xong', 'finish', 'completed', 'đã'];
const INPUT_WORDS = ['add', 'new', 'thêm', 'mới', 'tạo'];
const IN_PROGRESS_WORDS = ['progress', 'đang', 'chưa'];
@Component({
  selector: 'app-todo-today',
  templateUrl: './todo-today.component.html',
  styleUrls: ['./todo-today.component.scss']
})
export class TodoTodayComponent implements OnInit {

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
      browserNotSupported: 'Voice recognition is not supported in your browser'
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
      browserNotSupported: 'Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói'
    }
  };

  constructor(
    private todoTodayService: TodoTodayService,
    private todoLabelService: TodoLabelService,
    private alertService: AlertService
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
        this.alertService.showNoti(this.messages[this.currentLanguage].voiceError + event.error, 'danger');
      };
    }
  }

  ngOnInit() {
    this.searchToDoToDay();
  }

  addToDoToDay() {
    const sample: TodoToday = {
      content: ''
    }
    this.isLoadingResults = true;
    this.todoTodayService.addTodoToday(sample)
      .subscribe((res: any) => {
        this.data.push(res);
        this.isLoadingResults = false;
      }, err => {
        this.isLoadingResults = false;
      });
  }

  async searchToDoToDay() {
    await this._getTodoLabel();
    await this._getMyToDoToDay();
  }

  _getTodoLabel() {
    this.isLoadingResults = true;
    this.todoLabelService.getTodoLabels().subscribe((res: any) => {
      this.dataLabel = res;
      this.isLoadingResults = false;
    }, err => {
      this.isLoadingResults = false;
    });
  }

  _getMyToDoToDay(timeout = 0) {
    const value = this.searchDate && this.searchDate.value || new Date();
    const fromDate = dateFns.startOfDay(value);
    const toDate = dateFns.endOfDay(value);
    const req = {
      from: fromDate || undefined,
      to: toDate || undefined,
      status: this.searchStatus === 'NONE' ? undefined : this.searchStatus
    }
    this.isLoadingResults = true;
    this.todoTodayService.getMyTodoToday(req)
      .subscribe((res: any) => {
        this.data = res.map((el: TodoToday) => {
          return {
            ...el,
            checked: el.status === TDTD_STATUS.DONE,
            todoLabel: el.todoLabel && el.todoLabel.length ? el.todoLabel : this.todoLabelService.extractTodoLabel(el.content!, this.dataLabel)
          }
        }).sort((el: TodoToday) => isImportant(el.content!) ? -1 : 1);
        console.log('dangth, data', this.data);
        this.isLoadingResults = false;
      }, err => {
        this.isLoadingResults = false;
      });
  }
  setChangedLineOnly(res: TodoToday, index: number) {
    this.data[index] = { ...res, checked: res.status === TDTD_STATUS.DONE };
  }
  updateStatus(item: TodoToday, index: number) {
    const req = {
      ...item,
      status: toggleStatus(item.status!)
    };
    this.isLoadingResults = true;
    this.todoTodayService.updateTodoToday(item.id, req)
      .subscribe((res: any) => {
        this.setChangedLineOnly(res, index);
        this.isLoadingResults = false;
      }, err => {
        this.isLoadingResults = false;
      });
  }
  saveItem(id: number, item: TodoToday, index: number) {
    item.content = item.content?.trim();
    this.todoTodayService.updateTodoToday(id, item)
      .subscribe((res: any) => {
        this.setChangedLineOnly(res, index);
      }, err => {
      });
  }
  delete(id: number) {
    if (!this.data || !this.data.length) {
      return;
    }
    if (id) {
      this.isLoadingResults = true;
      this.todoTodayService.deleteTodoToday(id)
        .subscribe((_: any) => {
          this.data = this.data.filter(el => el.id !== id);
          this.isLoadingResults = false;
        }, err => {
          this.isLoadingResults = false;
        });
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

  sort(preIndex: number, curIndex: number) {
    const item = this.data[preIndex];
    const newOrder = Number(this.data[curIndex].order);
    const delta = preIndex > curIndex ? -1 : 1;
    return new Promise<any>((resolve, reject) => {
      const req = {
        ...item,
        order: newOrder + delta
      };
      this.todoTodayService.updateTodoToday(item.id, req)
        .subscribe((_: any) => {
          this.isLoadingResults = false;
          resolve('success');
        }, err => {
          this.isLoadingResults = false;
          reject('fail');
        });
    });
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
      } else if (transcript.includes('vietnamese') || transcript.includes('vietnam')) {
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
      this.alertService.showNoti(this.messages[this.currentLanguage].noMatch, 'warning');
    } else if (matchingTodos.length === 1) {
      const todo = matchingTodos[0];
      const index = this.data.findIndex(t => t.id === todo.id);
      if (index !== -1) {
        const updatedTodo = { ...todo, status: newStatus };
        this.todoTodayService.updateTodoToday(todo.id!, updatedTodo)
          .subscribe(
            (res: any) => {
              this.setChangedLineOnly(res, index);
              this.alertService.showNoti(this.messages[this.currentLanguage].statusUpdated, 'success');
            },
            err => {
              this.alertService.showNoti(this.messages[this.currentLanguage].updateFailed, 'danger');
            }
          );
      }
    } else {
      this.alertService.showNoti(this.messages[this.currentLanguage].multipleMatches, 'warning');
    }
  }

  addNewTodo(content: string) {
    const newTodo: TodoToday = {
      content: content,
      status: TDTD_STATUS.NEW
    };

    this.todoTodayService.addTodoToday(newTodo)
      .subscribe(
        (res: any) => {
          this.data.push(res);
          this.alertService.showNoti(this.messages[this.currentLanguage].newTodoAdded, 'success');
        },
        err => {
          this.alertService.showNoti(this.messages[this.currentLanguage].addFailed, 'danger');
        }
      );
  }

  toggleVoiceRecognition() {
    if (!this.recognition) {
      this.alertService.showNoti(this.messages[this.currentLanguage].browserNotSupported, 'warning');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.isListening = true;
      this.recognition.start();
    }
  }
}
