import { Module } from "@nestjs/common";
import { TekmetricModule } from "../tekmetric/tekmetric.module";
import { JobsService } from "./jobs.service";
import { ShopwareModule } from "../shopware/shopware.module";
import { ProtractorModule } from "../protractor/protractor.module";
import { ScheduleModule } from "@nestjs/schedule";
import { GooglesheetModule } from "../googlesheet/googlesheet.module";
import { AccuzipModule } from "../accuzip/accuzip.module";
import { ListcleanupModule } from "../listcleanup/listcleanup.module";

@Module({
  imports: [
    TekmetricModule,
    ShopwareModule,
    ProtractorModule,
    ScheduleModule.forRoot(),
    GooglesheetModule,
    AccuzipModule,
    ListcleanupModule
  ],
  providers: [JobsService],
})
export class JobsModule {}
