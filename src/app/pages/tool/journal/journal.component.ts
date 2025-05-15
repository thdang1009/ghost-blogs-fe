import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Journal, MoodItem, MoodType } from '@models/_index';
import { JournalService, MoodService } from '@services/_index';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit, OnDestroy {
  journalEntry: Journal = {};
  allMoods: MoodType[] = [];
  topMoods: MoodType[] = [];
  showAllMoods = false;
  currentDate = new Date();
  isLoading = false;
  hasUnsavedChanges = false;
  activeIconSelector: number | null = null;
  moodIconMap = new Map<number, string>();

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!event.target.closest('.icon-selector-wrapper')) {
      this.activeIconSelector = null;
    }
  }

  constructor(
    private journalService: JournalService,
    private moodService: MoodService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadMoods().then(() => {
      this.loadJournalForDate(this.currentDate);
    });
  }

  ngOnDestroy(): void {
    if (this.hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to save before leaving?')) {
        this.saveJournal();
      }
    }
  }

  async loadMoods(): Promise<void> {
    this.isLoading = true;
    try {
      const moods = await this.moodService.getAllMoodTypes().toPromise();
      this.allMoods = moods || [];

      // Create a map of mood.id to mood.icon for quick lookup
      this.allMoods.forEach(mood => {
        if (mood.id && mood.icon) {
          this.moodIconMap.set(mood.id, mood.icon);
        }
      });

      // Take the top 5 most used moods for quick selection
      this.topMoods = [...this.allMoods]
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 5);
      console.log('dangth topMoods', this.topMoods);
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading moods', error);
      this.isLoading = false;
    }
  }

  loadJournalForDate(date: Date): void {
    this.isLoading = true;
    const formattedDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    this.journalService.getJournalEntry(formattedDate).subscribe(
      (journal) => {
        if (journal && Object.keys(journal).length > 0) {
          // Use the API response
          this.journalEntry = journal;

          // Ensure details array exists
          if (!this.journalEntry.details || !Array.isArray(this.journalEntry.details)) {
            this.journalEntry.details = [];
          }
          console.log('dangth journalEntry', this.journalEntry);

          // Add default entries if less than 3
          if (this.journalEntry.details.length < 3) {
            const additionalEntries = 3 - this.journalEntry.details.length;
            for (let i = 0; i < additionalEntries; i++) {
              this.journalEntry.details.push({ icon: undefined, content: '' });
            }
          }
        } else {
          // Create a new journal entry if none exists
          this.journalEntry = {
            date,
            details: [
              { icon: undefined, content: '' },
              { icon: undefined, content: '' },
              { icon: undefined, content: '' }
            ]
          };
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading journal', error);
        this.isLoading = false;
        this.journalEntry = {
          date,
          details: [
            { icon: undefined, content: '' },
            { icon: undefined, content: '' },
            { icon: undefined, content: '' }
          ]
        };
      }
    );
  }

  previousDay(): void {
    const prevDay = new Date(this.currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    this.currentDate = prevDay;
    this.loadJournalForDate(this.currentDate);
  }

  nextDay(): void {
    const nextDay = new Date(this.currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    this.currentDate = nextDay;
    this.loadJournalForDate(this.currentDate);
  }

  onDateChange(event: any): void {
    this.currentDate = event.value;
    this.loadJournalForDate(this.currentDate);
  }

  toggleMoodSelection(): void {
    this.showAllMoods = !this.showAllMoods;
  }

  selectMood(mood: MoodType): void {
    if (this.journalEntry.moodId !== mood.id) {
      this.journalEntry.moodId = mood.id;
      this.hasUnsavedChanges = true;
      this.saveJournal();

      // Increment usage count for the selected mood
      if (mood.id) {
        this.moodService.incrementUsage(mood.id).subscribe();
      }
    }
  }

  addEntry(): void {
    this.journalEntry.details?.push({ icon: undefined, content: '' });
    this.hasUnsavedChanges = true;
  }

  onContentChange(): void {
    this.hasUnsavedChanges = true;
    this.autoSave();
  }

  toggleIconSelector(index: number): void {
    this.activeIconSelector = this.activeIconSelector === index ? null : index;
  }

  selectEntryIcon(moodId: number | undefined, index: number): void {
    if (this.journalEntry.details && this.journalEntry.details[index] && moodId) {
      this.journalEntry.details[index].icon = moodId;
      this.hasUnsavedChanges = true;
      this.activeIconSelector = null;
      this.autoSave();
    }
  }

  getMoodIconById(moodId: number): string {
    return this.moodIconMap.get(moodId) || '';
  }

  private autoSaveTimeout: any;

  autoSave(): void {
    // Clear any existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    // Set a new timeout to save after 1 second of inactivity
    this.autoSaveTimeout = setTimeout(() => {
      this.saveJournal();
    }, 1000);
  }

  saveJournal(): void {
    if (!this.hasUnsavedChanges) return;

    this.isLoading = true;

    if (this.journalEntry.id) {
      // Update existing entry
      this.journalService.updateJournalEntry(this.journalEntry.id, this.journalEntry).subscribe(
        (result) => {
          this.hasUnsavedChanges = false;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error updating journal', error);
          this.isLoading = false;
        }
      );
    } else {
      // Create new entry
      this.journalService.createJournalEntry(this.journalEntry).subscribe(
        (result) => {
          this.journalEntry = result;
          this.hasUnsavedChanges = false;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error creating journal', error);
          this.isLoading = false;
        }
      );
    }
  }
  search(): void {
    this.loadJournalForDate(this.currentDate);
  }
}
