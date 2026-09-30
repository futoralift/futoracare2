import { db } from '@/server/db/repository';
import { VoiceCall } from '@/types';

export class VoiceService {
  static getAll(): VoiceCall[] {
    return db.getVoiceCalls();
  }

  static triggerCall(data: {
    patientName: string;
    phone: string;
    purpose: string;
    aiHandled?: boolean;
  }): VoiceCall {
    return db.createVoiceCall(data);
  }
}
