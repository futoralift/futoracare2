import { db } from '@/server/db/repository';
import { WorkflowLog } from '@/types';

export class WorkflowService {
  static getAll(): WorkflowLog[] {
    return db.getWorkflows();
  }

  static rerun(id: string): WorkflowLog | null {
    return db.rerunWorkflow(id);
  }

  static create(data: { workflowName: string; trigger: string; nodes: number }): WorkflowLog {
    return db.createWorkflow(data);
  }
}
