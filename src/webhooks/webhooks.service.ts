// src/webhooks/webhooks.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Webhook } from 'svix';
import { UsersService } from '../users/users.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  constructor(private usersService: UsersService) {}

  async handleClerkWebhook(
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
    rawBody: Buffer,
    body: any
  ) {
    try {
      // Verificar se o secret está configurado
      if (!this.webhookSecret) {
        this.logger.error('CLERK_WEBHOOK_SECRET not configured');
        throw new UnauthorizedException('Webhook secret not configured');
      }

      // Verificar se os headers necessários estão presentes
      if (!svixId || !svixTimestamp || !svixSignature) {
        this.logger.error('Missing required webhook headers');
        throw new UnauthorizedException('Missing webhook headers');
      }

      // Verificar assinatura do webhook
      const wh = new Webhook(this.webhookSecret);
      const evt = wh.verify(rawBody.toString(), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as any;

      this.logger.log(`Webhook received: ${evt.type}`);
      
      // Processar evento
      switch (evt.type) {
        case 'user.created':
          await this.handleUserCreated(evt.data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(evt.data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(evt.data);
          break;
        default:
          this.logger.warn(`Unhandled webhook type: ${evt.type}`);
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (err) {
      this.logger.error('Webhook verification failed', err.message);
      this.logger.error('Webhook error details:', err);
      throw new UnauthorizedException('Webhook verification failed');
    }
  }

  private async handleUserCreated(userData: any) {
  try {
    const { id, email_addresses } = userData;
    
    // Log para debug
    this.logger.log(`Processando user.created: ${id}`);
    this.logger.log(`Email addresses: ${JSON.stringify(email_addresses)}`);

    // Verificar se tem email
    if (!email_addresses || email_addresses.length === 0) {
      this.logger.warn(`Usuário ${id} não tem email addresses, ignorando`);
      return;
    }

    const email = email_addresses[0]?.email_address;
    if (!email) {
      this.logger.warn(`Usuário ${id} não tem email válido, ignorando`);
      return;
    }

    await this.usersService.syncWithClerk(userData);
    this.logger.log(`User criado/atualizado: ${email}`);

  } catch (error) {
    this.logger.error('Erro no handleUserCreated:', error);
    // Não throw error aqui para não quebrar o webhook
  }
}

  private async handleUserUpdated(userData: any) {
    await this.handleUserCreated(userData); // Reusa a mesma lógica
  }

  private async handleUserDeleted(userData: any) {
    try {
      const { id } = userData;
      
      await this.usersService.removeByClerkId(id);
      this.logger.log(`User deleted: ${id}`);

    } catch (error) {
      this.logger.error('Error handling user deleted:', error);
    }
  }
}