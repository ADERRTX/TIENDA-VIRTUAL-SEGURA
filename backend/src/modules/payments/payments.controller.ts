import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  UsePipes,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { processPaymentSchema, ProcessPaymentInput } from './payments.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsRepo: PaymentsRepository,
  ) {}

  @Post()
  @UsePipes(new ZodPipe(processPaymentSchema))
  async process(
    @CurrentUser() user: RequestUser,
    @Body() body: ProcessPaymentInput,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<{ data: unknown }> {
    const result = await this.paymentsService.processPayment(user.id, body, idempotencyKey);
    return { data: result };
  }

  @Get(':orderId')
  async getPayment(
    @Param('orderId') orderId: string,
  ): Promise<{ data: unknown }> {
    const payment = await this.paymentsRepo.findApprovedPaymentByOrder(orderId);
    return { data: payment };
  }
}
