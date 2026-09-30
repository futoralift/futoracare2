import { db } from '@/server/db/repository';
import { ChatMessage, SentimentType, WhatsAppThread } from '@/types';

export class AIChatService {
  static getThreads(): WhatsAppThread[] {
    return db.getWhatsAppThreads();
  }

  static getThread(id: string): WhatsAppThread | undefined {
    return db.getWhatsAppThreadById(id);
  }

  static generateResponse(patientMessage: string): { responseText: string; sentiment: SentimentType; isEmergency: boolean } {
    const lower = patientMessage.toLowerCase();

    // Critical Emergency checks
    if (
      lower.includes('chest pain') ||
      lower.includes('heart attack') ||
      lower.includes('difficulty breathing') ||
      lower.includes('unconscious') ||
      lower.includes('heavy bleeding') ||
      lower.includes('emergency')
    ) {
      return {
        responseText:
          '🚨 EMERGENCY ALERT: Your symptoms require immediate medical attention. Please call our Emergency Helpline 040-6789-9999 or proceed to the nearest ER immediately. Our on-duty clinical team has been alerted.',
        sentiment: 'negative',
        isEmergency: true,
      };
    }

    if (lower.includes('reschedule') || lower.includes('postpone') || lower.includes('change date') || lower.includes('change time')) {
      return {
        responseText:
          'Sure! I can help you reschedule your visit. What preferred date (e.g. Tomorrow) and time slot (Morning / Afternoon / Evening) works best for you?',
        sentiment: 'neutral',
        isEmergency: false,
      };
    }

    if (lower.includes('book') || lower.includes('appointment') || lower.includes('consult')) {
      return {
        responseText:
          'I would be happy to schedule your consultation! Which department (Cardiology, Endocrinology, Obstetrics, Orthopedics, Neurology, or General Medicine) would you like to visit?',
        sentiment: 'positive',
        isEmergency: false,
      };
    }

    if (lower.includes('report') || lower.includes('result') || lower.includes('blood test') || lower.includes('lab')) {
      return {
        responseText:
          'Your lab test reports have been verified by our clinical pathologist. I can dispatch a digital PDF directly to your WhatsApp or summarize abnormal parameters. Would you like me to send the PDF?',
        sentiment: 'positive',
        isEmergency: false,
      };
    }

    if (lower.includes('doctor') || lower.includes('timing') || lower.includes('available')) {
      return {
        responseText:
          'Dr. Arun Mehta (Endocrinology) and Dr. Sunita Rao (Obstetrics) are available today. Dr. Vijay Kapoor (Cardiology) has slots open tomorrow morning from 9:00 AM.',
        sentiment: 'positive',
        isEmergency: false,
      };
    }

    return {
      responseText:
        'Hello! I am Futoracare AI Assistant. I can help you book or reschedule appointments, review lab reports, access hospital services, or connect with medical staff. How may I assist you today?',
      sentiment: 'positive',
      isEmergency: false,
    };
  }

  static processMessage(threadId: string, content: string, role: 'patient' | 'staff' = 'patient'): { patientMsg: ChatMessage; aiReply?: ChatMessage } {
    const isPatient = role === 'patient';
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const pMsgData: Omit<ChatMessage, 'id'> = {
      role,
      content,
      timestamp: now,
    };
    const threadAfterPatient = db.addWhatsAppMessage(threadId, pMsgData);
    const patientMsg = threadAfterPatient?.messages[threadAfterPatient.messages.length - 1] || {
      id: `m_${Date.now()}`,
      ...pMsgData,
    };

    if (!isPatient) {
      return { patientMsg };
    }

    // Generate AI response
    const { responseText, sentiment } = this.generateResponse(content);
    const aiMsgData: Omit<ChatMessage, 'id'> = {
      role: 'ai',
      content: responseText,
      timestamp: now,
      sentiment,
    };
    const threadAfterAi = db.addWhatsAppMessage(threadId, aiMsgData);
    const aiReply = threadAfterAi?.messages[threadAfterAi.messages.length - 1] || {
      id: `m_ai_${Date.now()}`,
      ...aiMsgData,
    };

    return { patientMsg, aiReply };
  }

  static resolveThread(threadId: string): boolean {
    const updated = db.markWhatsAppResolved(threadId);
    return !!updated;
  }
}
