import { Inject, Injectable, Logger } from "@nestjs/common";
import _ from "lodash";
import { Pool } from "pg";

const shops = {
  content: [
    {
      id: 5095,
      environment: "shop.tekmetric.com",
      name: "Toledo Tire & Auto Care",
      nickname: "M1",
      phone: "4194797350",
      email: "serviceneeded@toledoautocare.com",
      website: "https://www.toledoautocare.com/",
      timeZoneId: "America/New_York",
      address: {
        id: 27968101,
        address1: "4544 Monroe Street",
        address2: "4544 Monroe st",
        city: "Toledo",
        state: "OH",
        zip: "43613",
        fullAddress: "4544 Monroe Street 4544 Monroe st, Toledo, OH 43613",
        streetAddress: "4544 Monroe Street 4544 Monroe st",
      },
      roCustomLabelEnabled: true,
    },
    {
      id: 5096,
      environment: "shop.tekmetric.com",
      name: "Toledo Tire & Auto Care",
      nickname: "H2",
      phone: "4198655584",
      email: "serviceh@toledoautocare.com",
      website: "https://www.toledoautocare.com/",
      timeZoneId: "America/New_York",
      address: {
        id: 27968134,
        address1: "5329 Heatherdowns Boulevard",
        address2: "ToledoAutoCare.com",
        city: "Toledo",
        state: "OH",
        zip: "43614",
        fullAddress:
          "5329 Heatherdowns Boulevard ToledoAutoCare.com, Toledo, OH 43614",
        streetAddress: "5329 Heatherdowns Boulevard ToledoAutoCare.com",
      },
      roCustomLabelEnabled: true,
    },
    {
      id: 5097,
      environment: "shop.tekmetric.com",
      name: "B&L Tire & Auto Service",
      nickname: "B3",
      phone: "4198775330",
      email: "service@bandlautoservice.com",
      website: "https://www.toledoautocare.com/b-l-whitehouse/",
      timeZoneId: "America/New_York",
      address: {
        id: 27968153,
        address1: "10829 Logan Street",
        address2: "BandLAutoService.com",
        city: "Whitehouse",
        state: "OH",
        zip: "43571",
        fullAddress:
          "10829 Logan Street BandLAutoService.com, Whitehouse, OH 43571",
        streetAddress: "10829 Logan Street BandLAutoService.com",
      },
      roCustomLabelEnabled: true,
    },
    {
      id: 5652,
      environment: "shop.tekmetric.com",
      name: "HOUSTON TEXAS AUTO CARE",
      nickname: null,
      phone: "8328345634",
      email: "HOUSTONTEXASAUTO@GMAIL.COM",
      website: null,
      timeZoneId: "America/Chicago",
      address: {
        id: 31536638,
        address1: "9413 South Main Street",
        address2: "",
        city: "Houston",
        state: "TX",
        zip: "77025",
        fullAddress: "9413 South Main Street, Houston, TX 77025",
        streetAddress: "9413 South Main Street",
      },
      roCustomLabelEnabled: true,
    },
  ],
};

const customers = {
  content: [
    {
      id: 31033146,
      firstName: "",
      lastName: "",
      email: "",
      phone: [
        {
          id: 34909769,
          number: "4198707650",
          type: "Home",
          primary: true,
        },
      ],
      address: {
        id: 31081798,
        address1: "",
        address2: null,
        city: "Toledo",
        state: "OH",
        zip: "43613",
      },
      notes: "",
      customerType: {
        id: 2,
        code: "BUSINESS",
        name: "Business",
      },
      contactFirstName: null,
      contactLastName: null,
      shopId: 5095,
      okForMarketing: true,
      createdDate: new Date("2023-04-01T00:00:00Z"),
      updatedDate: null,
      deletedDate: null,
      birthday: null,
    },
  ],
};

const jobs = {
  content: [
    {
      id: 307752823,
      repairOrderId: 93427228,
      vehicleId: 23883797,
      customerId: 16391805,
      name: "New Job",
      authorized: null,
      authorizedDate: null,
      selected: true,
      technicianId: null,
      note: null,
      cannedJobId: null,
      jobCategoryName: null,
      partsTotal: 2799998,
      laborTotal: 0,
      discountTotal: 0,
      feeTotal: 0,
      subtotal: 2799998,
      archived: false,
      createdDate: new Date("2023-04-18T20:16:54Z"),
      completedDate: null,
      updatedDate: new Date("2023-04-18T20:20:27Z"),
      labor: [],
      parts: [
        {
          id: 282711778,
          quantity: 2.0,
          brand: "",
          name: "Cabin Air Filter",
          partNumber: "94211X",
          description: null,
          cost: 999999,
          retail: 1399999,
          model: null,
          width: null,
          ratio: null,
          diameter: null,
          constructionType: null,
          loadIndex: null,
          speedRating: null,
          partType: {
            id: 1,
            code: "PART",
            name: "Part",
          },
          partStatus: {
            id: 1,
            code: "ORDERED",
            name: "Ordered",
          },
          dotNumbers: [],
        },
      ],
      fees: [],
      discounts: [],
      laborHours: 0.0,
      loggedHours: null,
      sort: null,
    },
  ],
};

type TekmetricShop = {
  id: number;
  environment: string | null;
  name: string | null;
  nickname: string | null;
  phone: string;
  email: string | null;
  website: string | null;
  timeZoneId: string | null;
  address: {
    id: number;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    fullAddress: string | null;
    streetAddress: string | null;
  };
  roCustomLabelEnabled: boolean;
};

type TekmetricJob = {
  id: number;
  repairOrderId: number;
  vehicleId: number;
  customerId: number;
  name: string | null;
  authorized: boolean | null;
  authorizedDate: string | null;
  selected: boolean | null;
  technicianId: number | null;
  note: string | null;
  cannedJobId: number | null;
  jobCategoryName: string | null;
  partsTotal: number | null;
  laborTotal: number | null;
  discountTotal: number | null;
  feeTotal: number | null;
  subtotal: number | null;
  archived: boolean | null;
  createdDate: Date | null;
  completedDate: Date | null;
  updatedDate: Date | null;
  labor: any[] | null;
  parts: any[] | null;
  fees: any[] | null;
  discounts: any[] | null;
  laborHours: number | null;
  loggedHours: number | null;
  sort: number | null;
};

type TekmetricCustomer = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: any[];
  address: {
    id: number;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  notes: string | null;
  customerType: {
    id: number;
    code: string | null;
    name: string | null;
  };
  contactFirstName: string | null;
  contactLastName: string | null;
  shopId: number;
  okForMarketing: boolean | null;
  createdDate: Date | null;
  updatedDate: Date | null;
  deletedDate: Date | null;
  birthday: Date | null;
};
@Injectable()
export class TekmetricService {
  private readonly logger = new Logger(TekmetricService.name);

  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

  async fetchShopData() {
    await this.writeShopsToDB(shops.content);
    await this.writeCustomersToDB(customers.content);
    await this.writeJobsToDB(jobs.content);
  }

  async writeShopsToDB(tekmetricShops: TekmetricShop[]) {
    console.log("start");
    const shops = tekmetricShops.reduce(
      (result, shop) => ({
        ids: [...result.ids, shop.id],
        names: [...result.names, shop.name],
        phones: [...result.phones, shop.phone],
      }),
      {
        ids: [] as number[],
        names: [] as (string | null)[],
        phones: [] as (string | null)[],
      },
    );
    await this.db.query(
      `
      INSERT INTO shop (
        tekmetric_shop_id,
        name,
        phone
      )
      SELECT * FROM UNNEST (
        $1::int[],
        $2::text[],
        $3::text[]
      )
      ON CONFLICT (tekmetric_shop_id)
      DO UPDATE
      SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone`,
      [shops.ids, shops.names, shops.phones],
    );
  }

  async writeJobsToDB(tekmetricjobs: TekmetricJob[]) {
    console.log("start job");
    const jobs = tekmetricjobs.reduce(
      (result, job) => ({
        ids: [...result.ids, job.id],
        createddate: [...result.createddate, job.createdDate],
        updateddate: [...result.updateddate, job.updatedDate],
        customer_id: [...result.customer_id, job.customerId],
      }),
      {
        ids: [] as number[],
        createddate: [] as (Date | null)[],
        updateddate: [] as (Date | null)[],
        customer_id: [] as number[],
      },
    );
    await this.db.query(
      `
      INSERT INTO job (
        job_id,
        createddate,
        updateddate,
        customer_id
      )
      SELECT * FROM UNNEST (
        $1::int[],
        $2::date[],
        $3::date[],
        $4::int[]
      )
      ON CONFLICT (job_id)
      DO UPDATE
      SET
        createddate = EXCLUDED.createddate,
        updateddate = EXCLUDED.updateddate,
        customer_id = EXCLUDED.customer_id`,
      [jobs.ids, jobs.createddate, jobs.updateddate, jobs.customer_id],
    );
  }

  async writeCustomersToDB(tekmetriccustomers: TekmetricCustomer[]) {
    console.log("start customer");
    const customers = tekmetriccustomers.reduce(
      (result, customer) => ({
        ids: [...result.ids, customer.id],
        shop_id: [...result.shop_id, customer.shopId],
      }),
      {
        ids: [] as number[],
        shop_id: [] as number[],
      },
    );
    await this.db.query(
      `
      INSERT INTO customer (
        tekmetric_customer_id,
        shop_id,
      )
      SELECT * FROM UNNEST (
        $1::int[],
        $2::int[]
      )
      ON CONFLICT (tekmetric_customer_id)
      DO UPDATE
      SET
      shop_id = EXCLUDED.shop_id
        `,
      [customers.ids, customers.shop_id],
    );
  }
}
