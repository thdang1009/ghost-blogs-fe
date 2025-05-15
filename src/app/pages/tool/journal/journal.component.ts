import { Component, OnInit, OnDestroy } from '@angular/core';
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

  constructor(
    private journalService: JournalService,
    private moodService: MoodService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadMoods();
    this.loadJournalForDate(this.currentDate);
  }

  ngOnDestroy(): void {
    if (this.hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to save before leaving?')) {
        this.saveJournal();
      }
    }
  }

  loadMoods(): void {
    this.isLoading = true;
    this.moodService.getAllMoodTypes().subscribe(
      (moods) => {
        this.allMoods = moods;
        // Take the top 5 most used moods for quick selection
        this.topMoods = moods
          .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
          .slice(0, 5);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading moods', error);
        this.isLoading = false;
      }
    );
  }

  loadJournalForDate(date: Date): void {
    this.isLoading = true;
    const formattedDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    this.journalService.getJournalEntry(formattedDate).subscribe(
      (journal) => {
        this.journalEntry = journal || { date, details: [] };
        if (!this.journalEntry.details || this.journalEntry.details.length === 0) {
          this.journalEntry.details = [
            { icon: '', content: '' },
            { icon: '', content: '' },
            { icon: '', content: '' }
          ];
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading journal', error);
        this.isLoading = false;
        this.journalEntry = { date, details: [
          { icon: '', content: '' },
          { icon: '', content: '' },
          { icon: '', content: '' }
        ] };
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
    this.journalEntry.details?.push({ icon: '', content: '' });
    this.hasUnsavedChanges = true;
  }

  onContentChange(): void {
    this.hasUnsavedChanges = true;
    this.autoSave();
  }

  onIconChange(icon: string, index: number): void {
    if (this.journalEntry.details && this.journalEntry.details[index]) {
      this.journalEntry.details[index].icon = icon;
      this.hasUnsavedChanges = true;
      this.autoSave();
    }
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

  searchByDate(searchDate: string): void {
    this.currentDate = new Date(searchDate);
    this.loadJournalForDate(this.currentDate);
  }
}
