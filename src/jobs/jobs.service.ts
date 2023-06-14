import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import _, { countBy, result } from "lodash";
import { TekmetricService } from "../tekmetric/tekmetric.service";
import { TekmetricCustomerService } from "../tekmetric/tekmetric.customer.service";
import { TekmetricJobService } from "../tekmetric/tekmetric.job.service";
import { TekmetricRepairOrderService } from "../tekmetric/tekmertric.repairorder.service";
import { TekmetricShopService } from "../tekmetric/tekmetric.shop.service";
import { TekmetricEmployeeService } from "../tekmetric/tekmetric.employee.service";
import { TekmetricDeduplicate } from "../tekmetric/tekmetric.deduplicate.service";
import { ShopwareService } from "../shopware/shopware.service";
import { ProtractorService } from "../protractor/protractor.service";
import { GooglesheetService } from "../googlesheet/googlesheet.service";
import { AccuzipApiService } from "../accuzip/api.service";

const shopIds = [
  // '1',
  // '155',
  // '188',
  // '293',
  // '309',
  // "331",
  // "377",
  // "398",
  // "508",
  // "545",
  // "572",
  // "589",
  // "1008",
  // "1079",
  // "1112",
  // "1159",
  // "1213",
  // "1216",
  // "1218",
  // "1342",
  // "1380",
  // "1398",
  // "1552",
  // "1667",
  // "1692",
  // "1873",
  // "2172",
  // "2305",
  // "2442",
  // "2905",
  // "3028",
  // "3229", //~~~~~~~~~~~~~~~~
  "3253",
  "3302",
  // "3341",
  "3343",
  "3351",
  "3385",
  "3472",
  "3520",
  "3539",
  // "3540",
  "3541",
  // "3542",
  // "3543",
  // "3547",
  // "3586",
  // "3690",
  // "3707",
  // "3747",
  // "3758",
  // "3759",
  // "3761",
  "4120",
  // "4299",
  // "4406",
  // "4494",
  // "4929",
  // "5095",
  // "5096",
  // "5097",
  // "5652",
  // "5803",
  "888",
];

/**
 * Background jobs service
 */
@Injectable()
export class JobsService {
  readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly tekmetricService: TekmetricService,
    private readonly shopwareServic: ShopwareService,
    private readonly protractorService: ProtractorService,
    private readonly tekmetricCustomerService: TekmetricCustomerService,
    private readonly tekmetricJobService: TekmetricJobService,
    private readonly tekmetricRepairOrtherService: TekmetricRepairOrderService,
    private readonly tekmetricShopService: TekmetricShopService,
    private readonly tekmetricEmployeeService: TekmetricEmployeeService,
    private readonly googlesheetService: GooglesheetService,
    private readonly tekmetricDeduplicate: TekmetricDeduplicate,
    private readonly accuzipApiService: AccuzipApiService,
  ) {
    this.runSyncJob = this.runSyncJob.bind(this);
    this.logException = this.logException.bind(this);
  }

  @Cron(new Date(Date.now() + 1 * 1000))
  //Runing hourly
  // @Cron('0 8-21 * * *',{
  //   timeZone: 'America/New_York',  // specifying Eastern Time Zone
  // })
  TEKMETRICtestJob() {
    return this.runSyncJob("Test Job", async () => {
      this.logger.log(`TEKMETRICTest job is executing...`);

      const owners = await this.tekmetricDeduplicate.fetchChainShops()

      console.log(owners)

    });
  }

  // @Cron(new Date(Date.now() + 5 * 1000))
  // @Cron('0 0-8,21-23 * * *',{
  //   timeZone: 'America/New_York',  // specifying Eastern Time Zone
  // })
  // ShopwaretestJob() {
  //   return this.runSyncJob("Test Job", async () => {
  //     this.logger.log(`ProtractorTest job is executing...`);
  //   });
  // }

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
