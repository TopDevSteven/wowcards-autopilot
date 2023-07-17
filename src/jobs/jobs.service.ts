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
  'storeId': string,
  'Store Name': string,
  'MONTH mix':  string,
  'First': string | null,
  'Last': string | null,
  'Address Line 1': string | null,
  'City': string | null,
  'State': string | null,
  'Zip': string | null,
  'DPBC': string | null,
  'CRRT': string | null,
  'lastVisitDate': string | null,
  'firstVisitDate': string | null,
  'totalSales': string | null,
  'totalVisits': string | null,
  'averageRepairOrder': string | null,
  'MDCOMPANY': string | null,
  'MDDOB': string | null,
  'Day cust': string | null,
  'YEAR mix': string | null
}
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
    private readonly protractorContactService: ProtractorContactService
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


      const allShops  = {
        tek: [
          {
            wow_shop_id: 1023,
            shopname: "Aero Auto Repair",
            shop_id: 1159,
            chain_id:101,
            software: "Tek"
          },
          {
            wow_shop_id: 1024,
            shopname: "Aero Auto Repair",
            shop_id: 1552,
            chain_id:101,
            software: "Tek"
          },
          {
            wow_shop_id: 1025,
            shopname: "Aero Auto Repair San Carlos",
            shop_id: 3028,
            chain_id:101,
            software: "Tek"
          },
          {
            wow_shop_id: 1026,
            shopname: "Aero Auto Repair San Carlos",
            shop_id: 3472,
            chain_id:101,
            software: "Tek"
          },
          {
            wow_shop_id: 1028,
            shopname: "O'Bryan Auto Repair",
            shop_id: 1692,
            chain_id:102,
            software: "Tek"
          },
          {
            wow_shop_id: 1027,
            shopname: "O'Bryan Auto Repair",
            shop_id: 331,
            chain_id:102,
            software: "Tek"
          },
          {
            wow_shop_id: 1029,
            shopname: "Matt's Automotive Service Center Pine City",
            shop_id: 1873,
            chain_id:104,
            software: "Tek"
          },
          {
            wow_shop_id: 1030,
            shopname: "Matt's Automotive Service Center NOMO",
            shop_id: 3539,
            chain_id:104,
            software: "Tek"
          },
          {
            wow_shop_id: 1031,
            shopname: "Matt's Automotive Service Center Fargo",
            shop_id: 3540,
            chain_id:104,
            software: "Tek"
          },
          {
            wow_shop_id: 1032,
            shopname: "Matt's Automotive Service Center SOMO",
            shop_id: 3541,
            chain_id:104,
            software: "Tek"
          },
          {
            wow_shop_id: 1033,
            shopname: "Matt's Automotive Service Center S Fago",
            shop_id: 3542,
            chain_id:104,
            software: "Tek"
          },
          {
            wow_shop_id: 1034,
            shopname: "Matt's Automotive & Collision Center Collision",
            shop_id: 3543,
            chain_id:104,
            software: "Tek"
          },
          {
            wow_shop_id: 1035,
            shopname: "Matt's Automotive Service Center Bloomington",
            shop_id: 3547,
            chain_id:104,
            software: "Tek"
          },
          {
            wow_shop_id: 1036,
            shopname: "Matt's Automotive Service Center Columbia Heights",
            shop_id: 3758,
            chain_id:104,
            software: "Tek"
          },
          {
            wow_shop_id: 1037,
            shopname: "Matt's Automotive Service Center Willmar",
            shop_id: 3759,
            chain_id:104,
            software: "Tek"
          },
          {
            wow_shop_id: 1038,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 3761,
            chain_id:104,
            software: "Tek"
          },
          {
            wow_shop_id: 1039,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 293,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1040,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 309,
            chain_id:0,
            software: "Tek"
          },
          {
            wow_shop_id: 1041,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 398,
            chain_id:0,
            software: "Tek"
          },
          {
            wow_shop_id: 1042,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 2305,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1043,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 2442,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1044,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 3229,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1045,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 3351,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1046,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 3385,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1047,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 3520,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1048,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 3586,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1049,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 4120,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1050,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 4494,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1051,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 1216,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1052,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 1398,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1053,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 888,
            chain_id: 0,
            software: "Tek"
          },
          {
            wow_shop_id: 1054,
            shopname: "Matt's Automotive Service Center North Branch",
            shop_id: 4743,
            chain_id: 0,
            software: "Tek"
          },
        ],
        pro: [
          {
            wow_shop_id: 1017,
            shopname:"Sours VA",
            fixed_shopname: "Sours Automotive",
            shop_id: "",
            chain_id: 0,
            software: "pro"
          },
          {
            wow_shop_id: 1016,
            shopname:"AG Automotive - OR",
            fixed_shopname: "AG Automotive",
            shop_id: "",
            chain_id: 0,
            software: "pro"
          },
          {
            wow_shop_id: 1018,
            shopname:"Highline – AZ",
            fixed_shopname: "Highline Car Care",
            shop_id: "",
            chain_id: 0,
            software: "pro"
          },
          {
            wow_shop_id: 1013,
            shopname:"Toledo Autocare - B&L Whitehouse 3RD location",
            fixed_shopname: "B&L Whitehouse Auto Service",
            shop_id: "",
            chain_id: 103,
            software: "pro"
          },
          {
            wow_shop_id: 1014,
            shopname:"Toledo Autocare - HEATHERDOWNS 2ND location",
            fixed_shopname: "Toledo Auto Care",
            shop_id: "",
            chain_id: 103,
            software: "pro"
          },
          {
            wow_shop_id: 1015,
            shopname:"Toledo Autocare - Monroe Street 1ST location",
            fixed_shopname: "Toledo Auto Care - Monroe",
            shop_id: "",
            chain_id: 103,
            software: "pro"
          },
        ],
        sw: [
          {
            wow_shop_id: 1019,
            shopname: "West St. Service Center",
            shop_id: 5370,
            tenant_id: 3065,
            chain_id: 105,
            software: "SW"
          },
          {
            wow_shop_id: 1020,
            shopname: "Absolute Auto Repair Center - Shirley 2955",
            shop_id: 2955,
            tenant_id: 3065,
            chain_id: 105,
            software: "SW"
          },
          {
            wow_shop_id: 1021,
            shopname: "Absolute Auto Repair Center - Fitchburg 2954",
            shop_id: 2954,
            tenant_id: 3065,
            chain_id: 105,
            software: "SW"
          },
          {
            wow_shop_id: 1022,
            shopname: "Absolute Auto Repair Center - Fitchburg 2954",
            shop_id: 4200,
            tenant_id: 4186,
            chain_id: 0,
            software: "SW"
          }
        ]
      }

      // const res = await this.listcleanupService.saveAsCSVFile(allShops)

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

