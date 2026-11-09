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
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { processPaymentSchema, ProcessPaymentInput } from './payments.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
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
    @CurrentUser() user: RequestUser,
    @Param('orderId') orderId: string,
  ): Promise<{ data: unknown }> {
    const payment = await this.paymentsService.getPaymentByOrder(user.id, user.role, orderId);
    return { data: payment };
  }
}
