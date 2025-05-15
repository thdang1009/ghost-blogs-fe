import { MoodItem } from './mood-item';

export class Journal {
  id?: number;
  date?: Date;
  user?: number;
  moodId?: number;
  details?: MoodItem[];
  updatedAt?: Date;
}
