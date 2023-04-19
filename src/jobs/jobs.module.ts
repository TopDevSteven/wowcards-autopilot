import { Module } from "@nestjs/common";
import { TekmetricModule } from "../tekmetric/tekmetric.module";
import { JobsService } from "./jobs.service";

@Module({
  imports: [TekmetricModule],
  providers: [JobsService],
})
export class JobsModule {}
