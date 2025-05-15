import { MoodItem } from './mood-item';

export class Journal {
  id?: number;
  date?: Date;
  user?: number;
  moodId?: string;
  details?: MoodItem[];
  updatedAt?: Date;
}
