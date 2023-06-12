import { Module } from '@nestjs/common';
import { CallbackService } from './callback.service';
import { CallbackController } from './callback.controller';

@Module({
  providers: [CallbackService],
  controllers: [CallbackController]
})
export class CallbackModule {}
