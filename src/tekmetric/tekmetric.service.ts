import { ForbiddenException, Inject, Injectable, Logger } from "@nestjs/common";
import _, { StringNullableChain } from "lodash";
import { HttpService } from "@nestjs/axios";
import { Pool } from "pg";
import { map, catchError } from "rxjs/operators";

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
  constructor(
    private httpService: HttpService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async fetchShopData() {
    // await this.writeShopsToDB(shops.content);
    // await this.writeCustomersToDB(customers.content);
    await this.getMigraionDate(1);
    await this.getUpdatedDate(1);
    await this.getCustomerCount(5095);
    // await this.writeJobsToDB(jobs.content);
  }

  async getTekmetricToken() {
    const client_id = "GRqcvUWGnl8KvA5I";
    const client_secret = "Mns4FvSQcEW9RdhMCf7fmJtB";

    return this.httpService
      .post(
        "https://shop.tekmetric.com/api/v1/oauth/token?grant_type=client_credentials",
        null,
        {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(client_id + ":" + client_secret).toString("base64"),
          },
        },
      )
      .pipe(
        map((res) => {
          return res;
        }),
      )
      .pipe(
        catchError(() => {
          throw new ForbiddenException("API not available");
        }),
      );
  }

  async getTekmetricShops() {
    return this.httpService
      .get("https://sandbox.tekmetric.com/api/v1/shops", {
        headers: {
          Authorization: "Bearer " + "f4819111-c7d9-481c-a5c0-4b57f9fd9310",
        },
      })
      .pipe(
        map((res) => {
          return res;
        }),
      )
      .pipe(
        catchError(() => {
          throw new ForbiddenException("API not available");
        }),
      );
  }

  async getCustomersPerShop(shop_id: number) {
    return this.httpService
      .get(`https://shop.tekmetric.com/api/v1/customers?shop=${shop_id}`, {
        headers: {
          Authorization: "Bearer " + "f4819111-c7d9-481c-a5c0-4b57f9fd9310",
        },
      })
      .pipe(
        map((res) => {
          return res;
        }),
      )
      .pipe(
        catchError(() => {
          throw new ForbiddenException("API not available");
        }),
      );
  }

  async writeShopsToDB(tekmetricShops: TekmetricShop[]) {
    console.log("start");
    const shops = tekmetricShops.reduce(
      (result, shop) => ({
        tek_ids: [...result.tek_ids, shop.id],
        names: [...result.names, shop.name],
        phones: [...result.phones, shop.phone],
        emails: [...result.emails, shop.email],
        websites: [...result.websites, shop.website],
      }),
      {
        tek_ids: [] as number[],
        names: [] as (string | null)[],
        phones: [] as (string | null)[],
        emails: [] as (string | null)[],
        websites: [] as (string | null)[],
      },
    );
    await this.db.query(
      `
      INSERT INTO shop (
        tekmetric_shop_id,
        name,
        phone,
        email,
        website
      )
      SELECT * FROM UNNEST (
        $1::int[],
        $2::text[],
        $3::text[],
        $4::text[],
        $5::text[]
      )
      ON CONFLICT (tekmetric_shop_id)
      DO UPDATE
      SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.phone,
        website = EXCLUDED.website`,
      [shops.tek_ids, shops.names, shops.phones, shops.emails, shops.websites],
    );
  }

  async writeCustomersToDB(tekmetriccustomers: TekmetricCustomer[]) {
    console.log("start customer");
    const customers = tekmetriccustomers.reduce(
      (result, customer) => ({
        ids: [...result.ids, customer.id],
        shop_id: [...result.shop_id, customer.shopId],
        createdDates: [...result.createdDates, customer.createdDate],
        updatedDates: [...result.updatedDates, customer.updatedDate],
        customerTypes: [...result.customerTypes, customer.customerType.code],
        okForMarketings: [...result.okForMarketings, customer.okForMarketing],
      }),
      {
        ids: [] as number[],
        shop_id: [] as number[],
        createdDates: [] as (Date | null)[],
        updatedDates: [] as (Date | null)[],
        customerTypes: [] as (string | null)[],
        okForMarketings: [] as (boolean | null)[],
      },
    );
    await this.db.query(
      `
      INSERT INTO customer (
        id,
        tekmetric_shop_id,
        createdDate,
        updatedDate,
        customer_type,
        okformarketing
      )
      SELECT * FROM UNNEST (
        $1::int[],
        $2::int[],
        $3::date[],
        $4::date[],
        $5::text[],
        $6::boolean[]
      )
      ON CONFLICT (id)
      DO UPDATE
      SET
      id = EXCLUDED.id,
      tekmetric_shop_id = EXCLUDED.tekmetric_shop_id,
      createddate = EXCLUDED.createddate,
      updateddate = EXCLUDED.updateddate,
      customer_type = EXCLUDED.customer_type,
      okformarketing = EXCLUDED.okformarketing`,
      [
        customers.ids,
        customers.shop_id,
        customers.createdDates,
        customers.updatedDates,
        customers.customerTypes,
        customers.okForMarketings,
      ],
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

  async getMigraionDate(shopId: Number) {
    const response = await this.db.query(
      `
      select c.tekmetric_shop_id, date(c.createdDate) as migrationDate, count(date(c.createdDate)) as count
      from customer c 
      where c.tekmetric_shop_id = ${shopId}
      group by c.tekmetric_shop_id, migrationDate
      order by count DESC LIMIT 1

      `,
    );
    console.log(response);
    return response;
  }

  async getUpdatedDate(shopId: Number) {
    const response = await this.db.query(
      `
      select max(date(c.updatedDate)) as updatedDate from customer c 
      where c.tekmetric_shop_id = ${shopId}
      `,
    );
    console.log(response);
    return response;
  }

  async getCustomerCount(shopId: Number) {
    const response = await this.db.query(
      `
      select count(distinct c.id) as customerCount
      from customer c
      where
        c.tekmetric_shop_id =  ${shopId}
        and c.customer_type = 'PERSON'
        and c.okForMarketing = true
      `,
    );
    console.log(response);
    return response;
  }
}
