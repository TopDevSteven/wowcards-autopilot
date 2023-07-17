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
import { TekmetricSendEmailService } from "../tekmetric/tekmetric.sendemail.service";
import { TekBdayService } from "../tekmetric/tekmetric.bday.service";
import { ShopwareService } from "../shopware/shopware.service";
import { ShopwareCustomerService } from "../shopware/shopware.customer.service";
import { ShopwareRepairOrderService } from "../shopware/shopware.repairorders.service";
import { ShopwareShopService } from "../shopware/shopware.shop.service";
import { ShopWareDeduplicate } from "../shopware/shopware.deduplicate.service";
import { SWBdayService } from "../shopware/shopware.bday.service";
import { ProtractorService } from "../protractor/protractor.service";
import { ProtractorDeduplicateServiceItemService } from "../protractor/protractor.deduplicate.service";
import { ProtractorBdayService } from "../protractor/protractor.bday.service";
import { ProtractorContactService } from "../protractor/protractor.contact.service";
import { GooglesheetService } from "../googlesheet/googlesheet.service";
import { AccuzipApiService } from "../accuzip/api.service";
import { ListcleanupService } from "../listcleanup/listcleanup.service";

type CSVContactObject = {
  storeId: string;
  "Store Name": string;
  "MONTH mix": string;
  First: string | null;
  Last: string | null;
  "Address Line 1": string | null;
  City: string | null;
  State: string | null;
  Zip: string | null;
  DPBC: string | null;
  CRRT: string | null;
  lastVisitDate: string | null;
  firstVisitDate: string | null;
  totalSales: string | null;
  totalVisits: string | null;
  averageRepairOrder: string | null;
  MDCOMPANY: string | null;
  MDDOB: string | null;
  "Day cust": string | null;
  "YEAR mix": string | null;
};
/**
 * Background jobs service
 */
@Injectable()
export class JobsService {
  readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly tekmetricService: TekmetricService,
    private readonly shopwareServic: ShopwareService,
    private readonly shopwareCustomerService: ShopwareCustomerService,
    private readonly shopwareRepairOrderService: ShopwareRepairOrderService,
    private readonly shopwareShopService: ShopwareShopService,
    private readonly shopwareDeduplicateService: ShopWareDeduplicate,
    private readonly shopwareBdayService: SWBdayService,
    private readonly protractorService: ProtractorService,
    private readonly protractorDeduplicatedService: ProtractorDeduplicateServiceItemService,
    private readonly tekmetricCustomerService: TekmetricCustomerService,
    private readonly tekmetricJobService: TekmetricJobService,
    private readonly tekmetricRepairOrtherService: TekmetricRepairOrderService,
    private readonly tekmetricShopService: TekmetricShopService,
    private readonly tekmetricEmployeeService: TekmetricEmployeeService,
    private readonly tekmetricBdayService: TekBdayService,
    private readonly googlesheetService: GooglesheetService,
    private readonly tekmetricDeduplicate: TekmetricDeduplicate,
    private readonly accuzipApiService: AccuzipApiService,
    private readonly tekmetricSendEmailService: TekmetricSendEmailService,
    private readonly listcleanupService: ListcleanupService,
    private readonly protractorBdayService: ProtractorBdayService,
    private readonly protractorContactService: ProtractorContactService,
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
