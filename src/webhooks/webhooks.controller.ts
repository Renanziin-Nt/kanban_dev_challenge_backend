// src/webhooks/webhooks.controller.ts
import * as common from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@common.Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @common.Post('clerk')
  async handleClerkWebhook(
    @common.Headers('svix-id') svixId: string,
    @common.Headers('svix-timestamp') svixTimestamp: string,
    @common.Headers('svix-signature') svixSignature: string,
    @common.Req() req: common.RawBodyRequest<Request>,
    @common.Body() body: any
  ) {

    if (!req.rawBody) {
      throw new common.BadRequestException('Raw body is required for webhook verification');
    }

    return this.webhooksService.handleClerkWebhook(
      svixId,
      svixTimestamp,
      svixSignature,
      req.rawBody,
      body
    );
  }
}