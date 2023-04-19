import { Module } from "@nestjs/common";
import { TekmetricController } from "./tekmetric.controller";
import { TekmetricService } from "./tekmetric.service";

@Module({
  imports: [],
  controllers: [TekmetricController],
  providers: [TekmetricService],
  exports: [TekmetricService],
})
export class TekmetricModule {}
