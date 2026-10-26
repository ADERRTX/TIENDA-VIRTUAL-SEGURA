import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UsePipes,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodPipe } from '../../common/zod.pipe';
import { createReviewSchema, CreateReviewInput } from './reviews.dto';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('reviews')
  @UsePipes(new ZodPipe(createReviewSchema))
  async createReview(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateReviewInput,
  ): Promise<{ data: unknown }> {
    const review = await this.reviewsService.createReview(user.id, body);
    return { data: review };
  }

  @Public()
  @Get('products/:id/reviews')
  async getProductReviews(
    @Param('id') productId: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ): Promise<{ data: unknown; meta: unknown }> {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
    const result = await this.reviewsService.getProductReviews(productId, p, ps);
    return {
      data: {
        items: result.items,
        average: result.average,
        count: result.count,
      },
      meta: { page: p, pageSize: ps, total: result.total },
    };
  }
}
