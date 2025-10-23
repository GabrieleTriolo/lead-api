import { Injectable, Logger } from '@nestjs/common';
import { Lead } from '../../leads/entities/lead.entity';
import { RabbitmqService } from '../../rabbitmq/rabbitmq.service';
import { LeadRepository } from '../../leads/repositories/lead.repository';

export type CrmLeadAction = 'create' | 'update';

@Injectable()
export class CrmPublisherService {
  private readonly logger = new Logger(CrmPublisherService.name);
  private static readonly QUEUE = 'crm.lead.process';

  constructor(
    private readonly rabbit: RabbitmqService,
    private readonly leadRepo: LeadRepository,
  ) {}

  async publishLeadSync(action: CrmLeadAction, lead: Lead): Promise<void> {
    try {
      const fullLead = await this.leadRepo.findById(lead.id);
      const snapshot = fullLead ?? lead;
      const payload = this.buildPayload(action, snapshot);

      await this.rabbit.sendToQueue(CrmPublisherService.QUEUE, payload);

      this.logger.log(
        `Published CRM sync message action=${action} lead_id=${snapshot.id} -> queue=${CrmPublisherService.QUEUE}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to publish CRM sync message for lead ${lead?.id}: ${String(
          (err as Error)?.message ?? err,
        )}`,
      );
    }
  }

  private buildPayload(action: CrmLeadAction, lead: Lead) {
    return {
      event: 'crm.sync.lead',
      action,
      occurred_at: new Date().toISOString(),
      source: 'lead-api',
      data: lead,
    };
  }
}
