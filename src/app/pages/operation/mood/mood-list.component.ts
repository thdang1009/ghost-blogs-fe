import { Component, OnInit } from '@angular/core';
import { MoodType } from '@models/_index';
import { MoodService } from '@services/_index';

@Component({
  selector: 'app-mood-list',
  templateUrl: './mood-list.component.html',
  styleUrls: ['./mood-list.component.scss']
})
export class MoodListComponent implements OnInit {
  moods: MoodType[] = [];
  isLoading = false;
  showForm = false;
  editMode = false;
  currentMood: MoodType = {};

  displayedColumns: string[] = ['icon', 'name', 'description', 'usageCount', 'actions'];

  constructor(private moodService: MoodService) { }

  ngOnInit(): void {
    this.loadMoods();
  }

  loadMoods(): void {
    this.isLoading = true;
    this.moodService.getAllMoodTypes().subscribe(
      (moods) => {
        this.moods = moods;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading moods', error);
        this.isLoading = false;
      }
    );
  }

  openForm(mood?: MoodType): void {
    this.showForm = true;
    this.editMode = !!mood;

    if (mood) {
      this.currentMood = { ...mood };
    } else {
      this.currentMood = { name: '', description: '', icon: '', usageCount: 0 };
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.currentMood = {};
  }

  saveMood(): void {
    if (!this.currentMood.name) {
      alert('Name is required');
      return;
    }

    this.isLoading = true;

    if (this.editMode && this.currentMood.id) {
      this.moodService.updateMoodType(this.currentMood.id, this.currentMood).subscribe(
        (result) => {
          this.loadMoods();
          this.closeForm();
        },
        (error) => {
          console.error('Error updating mood', error);
          this.isLoading = false;
        }
      );
    } else {
      this.moodService.createMoodType(this.currentMood).subscribe(
        (result) => {
          this.loadMoods();
          this.closeForm();
        },
        (error) => {
          console.error('Error creating mood', error);
          this.isLoading = false;
        }
      );
    }
  }

  deleteMood(mood: MoodType): void {
    if (!mood.id) return;

    if (confirm(`Are you sure you want to delete the mood "${mood.name}"?`)) {
      this.isLoading = true;
      this.moodService.deleteMoodType(mood.id).subscribe(
        (result) => {
          this.loadMoods();
        },
        (error) => {
          console.error('Error deleting mood', error);
          this.isLoading = false;
        }
      );
    }
  }
}
