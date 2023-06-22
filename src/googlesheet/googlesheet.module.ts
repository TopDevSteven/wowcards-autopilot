import { Module } from "@nestjs/common";
import { GooglesheetService } from "./googlesheet.service";
import { TekmetricModule } from "../tekmetric/tekmetric.module";
import { ProtractorModule } from "../protractor/protractor.module";

@Module({
  imports: [TekmetricModule, ProtractorModule],
  controllers: [],
  providers: [GooglesheetService],
  exports: [GooglesheetService],
})
export class GooglesheetModule {}
