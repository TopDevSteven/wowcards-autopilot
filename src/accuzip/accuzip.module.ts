import { Module } from '@nestjs/common';
import { AccuzipService } from './accuzip.service';
import { AccuzipApiService } from './api.service';

@Module({
  providers: [
    AccuzipService,
    AccuzipApiService,
  ],
  exports: [
    AccuzipApiService,
    AccuzipService,
  ]
})
export class AccuzipModule {}
