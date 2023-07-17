import { Module } from "@nestjs/common";
import { AccuzipService } from "./accuzip.service";
import { AccuzipApiService } from "./api.service";
import { AccuzipController } from './accuzip.controller';

@Module({
  providers: [AccuzipService, AccuzipApiService],
  exports: [AccuzipApiService, AccuzipService],
  controllers: [AccuzipController],
})
export class AccuzipModule {}
