import { Module } from '@nestjs/common';
import { ListcleanupService } from './listcleanup.service';
import { TekmetricModule } from '../tekmetric/tekmetric.module';
import { ShopwareModule } from '../shopware/shopware.module';
import { ProtractorModule } from '../protractor/protractor.module';

@Module({
  imports: [
    TekmetricModule,
    ShopwareModule,
    ProtractorModule
  ],
  providers: [ListcleanupService],
  exports: [ListcleanupService]
})
export class ListcleanupModule {}
