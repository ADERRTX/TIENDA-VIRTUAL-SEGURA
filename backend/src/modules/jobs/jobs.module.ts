// [REGLAS & FUNCIONES: Configuración de Tareas en Segundo Plano (Jobs)] Configura tareas automáticas programadas mediante NestJS Schedule.
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
