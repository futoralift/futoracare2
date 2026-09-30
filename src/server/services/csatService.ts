import { db } from '@/server/db/repository';
import { Feedback } from '@/types';

export class CSATService {
  static getAll(): Feedback[] {
    return db.getFeedback();
  }

  static create(data: {
    patientName: string;
    rating: 1 | 2 | 3 | 4 | 5;
    emotion: 'delighted' | 'satisfied' | 'neutral' | 'frustrated' | 'angry';
    comment: string;
    department: string;
  }): Feedback {
    const sentiment = data.rating >= 4 ? 'positive' : data.rating === 3 ? 'neutral' : 'negative';
    return db.createFeedback({
      ...data,
      sentiment,
      autoApologyDispatched: data.rating <= 2,
    });
  }
}
