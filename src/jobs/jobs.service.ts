import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import _ from "lodash";
import { TekmetricService } from "../tekmetric/tekmetric.service";

const timeZone = "America/New_York";

/**
 * Background jobs service
 */
@Injectable()
export class JobsService {
  readonly logger = new Logger(JobsService.name);

  constructor(private readonly tekmetricService: TekmetricService) {
    this.runSyncJob = this.runSyncJob.bind(this);
    this.logException = this.logException.bind(this);
  }

  @Cron(new Date(Date.now() + 5 * 1000))
  // @Cron("5 4 * * *", { timeZone })
  testJob() {
    return this.runSyncJob("Test Job", async () => {
      this.logger.log(`Test job is executing...`);
      await this.tekmetricService.fetchShopData();
    });
  }

  async runSyncJob(name: string, func: () => Promise<void>) {
    this.logger.log(`START ${name}...`);
    await func();
    this.logger.log(`END ${name}...`);
  }

  logException(ex: unknown) {
    if (typeof ex === "object" && ex !== null && "message" in ex) {
      const err = ex as Error;
      this.logger.error(err.message, err.stack);
    } else {
      this.logger.error(ex);
    }
  }
}
