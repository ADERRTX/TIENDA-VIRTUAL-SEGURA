import { Controller, Post, Body } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants';

@Controller('admin/jobs')
@Roles(UserRole.ADMIN)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('run')
  async runJob(@Body() body: { job?: string }): Promise<{ data: unknown }> {
    if (body.job === 'expire_payments') {
      const res = await this.jobsService.cancelExpiredPayments();
      return { data: res };
    }
    if (body.job === 'expire_unconfirmed') {
      const res = await this.jobsService.cancelUnconfirmedSellerOrders();
      return { data: res };
    }
    if (body.job === 'finalize_delivered') {
      const res = await this.jobsService.finalizeDeliveredOrders();
      return { data: res };
    }
    const res = await this.jobsService.runAllJobs();
    return { data: res };
  }
}
