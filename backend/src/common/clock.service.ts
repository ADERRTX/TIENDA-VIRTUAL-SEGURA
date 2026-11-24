// [REGLAS & FUNCIONES: Servicio de Reloj del Sistema] Abstrae la obtención de la fecha/hora actual (now) para permitir simulación temporal en pruebas de custodia y cron jobs.
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClockService {
  now(): Date {
    return new Date();
  }

  addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
}
