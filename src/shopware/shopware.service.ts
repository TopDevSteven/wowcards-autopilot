import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ConfigService } from "@nestjs/config";
import { ShopWareApiService } from "./api.service";

type ShopwareData = {
  results: any[];
  limit: number | null;
  limited: boolean | null;
  total_count: number | null;
  current_page: number | null;
  total_pages: number | null;
};

type ShopWareShop = {
  id: number;
  created_at: Date | null;
  updated_at: Date | null;
  identifier: string | null;
  name: string | null;
  address: string | null;
  phone: string | null;
  time_zone: string | null;
  service_desk_email: string | null;
  avg_labor_cost_cents: number | null;
  part_tax_rate: number | null;
  labor_tax_rate: number | null;
  hazmat_tax_rate: number | null;
  sublet_tax_rate: number | null;
  supply_fee_rate: number | null;
  supply_fee_name: string | null;
  supply_fee_cap_cents: number | null;
  mycarfax_enabled: boolean | null;
  live_at: string | null;
  integrator_tags: any[] | null;
};

type ShopWareCustomer = {
  id: number;
  created_at: Date | null;
  updated_at: Date | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  detail: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null | number;
  marketing_ok: boolean | null;
  shop_ids: any[] | null;
  origin_shop_id: number | null;
  customer_type: string | null;
  fleet_id: number | string | null;
  email: string | null;
  integrator_tags: any[] | null;
  phones: any[] | null;
};

type ShopWareRepairOrder = {
  id: number;
  created_at: Date | null;
  updated_at: Date | null;
  number: number;
  odometer: number;
  odometer_out: number;
  state: string | null;
  customer_id: number;
  technician_id: number;
  advisor_id: number;
  vehicle_id: number;
  detail: string;
  preferred_contact_type: string | null;
  part_discount_cents: number | null;
  labor_discount_cents: number | null;
  shop_id: number;
  status_id: number;
  taxable: boolean;
  customer_source: string;
  supply_fee_cents: number;
  part_discount_percentage: number | null;
  labor_discount_percentage: number | null;
  fleet_po: null;
  start_at: Date | null;
  closed_at: Date | null;
  picked_up_at: Date | null;
  due_in_at: Date | null;
  due_out_at: Date | null;
  part_tax_rate: number | null;
  labor_tax_rate: number | null;
  hazmat_tax_rate: number | null;
  sublet_tax_rate: number | null;
  services: any[] | null;
  payments: any[] | null;
  integrator_tags: any[] | null;
  label: {
    text: string | null;
    color_code: string | null;
  };
};

type ShopWareJob = {
  id: number;
  created_at: Date | null;
  updated_at: Date | null;
  title: string | null;
  all_vehicles: boolean | null;
  frequency: number | null;
  category_id: number | null;
  auto_applied: boolean | null;
  shop_id: number;
  optimizer_enabled: boolean | null;
  integrator_tags: any[];
  sublets: any[];
  inspections: any[];
  vehicles: any[];
  hazmats: any[];
  parts: any[];
  labors: any[];
};

@Injectable()
export class ShopwareService {
  private readonly logger = new Logger(ShopWareApiService.name);
  constructor(
    private configService: ConfigService,
    private readonly apiService: ShopWareApiService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async fetchTenant() {
    const tenant = await this.apiService.fetch<ShopwareData>(`/tenants`);
    return tenant;
  }

  async fetchShopData(tanent_id: number) {
    const res = await this.apiService.fetch<ShopwareData>(
      `/tenants/${tanent_id}/shops`,
    );
    return res.results;
  }

  async fetchCustomerData(tanent_id: number) {
    const res = await this.apiService.fetch<ShopwareData>(
      `/tenants/${tanent_id}/customers`,
    );
    return res.results;
  }

  async fetchJobsDate(tanent_id: number) {
    const res = await this.apiService.fetch<ShopwareData>(
      `/tenants/${tanent_id}/canned_jobs`,
    );
    return res.results;
  }

  async fetchRepairOrder(tanent_id: number) {
    const res = await this.apiService.fetch<ShopwareData>(
      `/tenants/${tanent_id}/repair_orders`,
    );
    return res.results;
  }

  async writeShopsToDB(shopwareShops: ShopWareShop[]) {
    const shops = shopwareShops.reduce(
      (result, shop) => ({
        shopwareids: [...result.shopwareids, shop.id],
        names: [...result.names, shop.name],
        phones: [...result.phones, shop.phone],
        emails: [...result.emails, shop.service_desk_email],
      }),
      {
        shopwareids: [] as number[],
        names: [] as (string | null)[],
        phones: [] as (string | null)[],
        emails: [] as (string | null)[],
      },
    );
    await this.db.query(
      `
      INSERT INTO shopwareshop (
        shopware_shop_id,
        name,
        phone,
        email
      )
      SELECT * FROM UNNEST (
        $1::int[],
        $2::text[],
        $3::text[],
        $4::text[]
      )
      ON CONFLICT (shopware_shop_id)
      DO UPDATE
      SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email`,
      [shops.shopwareids, shops.names, shops.phones, shops.emails],
    );
  }

  async writeCustomersToDB(shopwarecustomers: ShopWareCustomer[]) {
    const customers = shopwarecustomers.reduce(
      (result, customer) => ({
        customerIds: [...result.customerIds, customer.id],
        createdAts: [...result.createdAts, customer.created_at],
        updatedAts: [...result.updatedAts, customer.updated_at],
        first_names: [...result.first_names, customer.first_name],
        last_names: [...result.last_names, customer.last_name],
        phones: [...result.phones, customer.phone],
        addresses: [...result.addresses, customer.address],
        cities: [...result.cities, customer.city],
        states: [...result.states, customer.state],
        zips: [...result.zips, customer.zip],
        customer_types: [...result.customer_types, customer.customer_type],
        okmarketings: [...result.okmarketings, customer.marketing_ok],
      }),
      {
        customerIds: [] as number[],
        createdAts: [] as (Date | null)[],
        updatedAts: [] as (Date | null)[],
        first_names: [] as (string | null)[],
        last_names: [] as (string | null)[],
        phones: [] as (string | null)[],
        addresses: [] as (string | null)[],
        cities: [] as (string | null)[],
        states: [] as (string | null)[],
        zips: [] as (string | number | null)[],
        customer_types: [] as (string | null)[],
        okmarketings: [] as (boolean | null)[],
      },
    );
    await this.db.query(
      `
      INSERT INTO shopwarecustomer (
        id,
        created_at,
        updated_at,
        first_name,
        last_name,
        phone,
        address,
        city,
        state,
        zip,
        customer_type,
        okmarketing
      )
      SELECT * FROM UNNEST (
        $1::int[],
        $2::date[],
        $3::date[],
        $4::varchar(50)[],
        $5::varchar(50)[],
        $6::varchar(50)[],
        $7::varchar(50)[],
        $8::varchar(50)[],
        $9::varchar(50)[],
        $10::varchar(50)[],
        $11::varchar(50)[],
        $12::boolean[]
      )
      ON CONFLICT (id)
      DO UPDATE
      SET
      id = EXCLUDED.id,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      zip = EXCLUDED.zip,
      customer_type = EXCLUDED.customer_type,
      okmarketing = EXCLUDED.okmarketing`,
      [
        customers.customerIds,
        customers.createdAts,
        customers.updatedAts,
        customers.first_names,
        customers.last_names,
        customers.phones,
        customers.addresses,
        customers.cities,
        customers.states,
        customers.zips,
        customers.customer_types,
        customers.okmarketings,
      ],
    );
  }

  async writeJobsToDB(shopwarejobs: ShopWareJob[]) {
    const jobs = shopwarejobs.reduce(
      (result, job) => ({
        jobIds: [...result.jobIds, job.id],
        titles: [...result.titles, job.title],
        shopIds: [...result.shopIds, job.shop_id],
        createdAts: [...result.createdAts, job.created_at],
        updatedAts: [...result.updatedAts, job.updated_at],
      }),
      {
        jobIds: [] as number[],
        titles: [] as (string | null)[],
        shopIds: [] as number[],
        createdAts: [] as (Date | null)[],
        updatedAts: [] as (Date | null)[],
      },
    );
    await this.db.query(
      `
      INSERT INTO shopwarejob (
        id,
        title,
        shopware_shop_id,
        created_at,
        updated_at
      )
      SELECT * FROM UNNEST (
        $1::int[],
        $2::text[],
        $3::int[],
        $4::date[],
        $5::date[]
      )
      ON CONFLICT (id)
      DO UPDATE
      SET
      title = EXCLUDED.title,
      shopware_shop_id = EXCLUDED.shopware_shop_id,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at`,
      [
        jobs.jobIds,
        jobs.titles,
        jobs.shopIds,
        jobs.createdAts,
        jobs.updatedAts,
      ],
    );
  }

  async writeRepairOrder(shopware_repairorders: ShopWareRepairOrder[]) {
    const repairorders = shopware_repairorders.reduce(
      (result, repairorder) => ({
        ids: [...result.ids, repairorder.id],
        created_ats: [...result.created_ats, repairorder.created_at],
        updated_ats: [...result.updated_ats, repairorder.updated_at],
        numbers: [...result.numbers, repairorder.number],
        states: [...result.states, repairorder.state],
        customer_ids: [...result.customer_ids, repairorder.customer_id],
        part_discount_cents: [
          ...result.part_discount_cents,
          repairorder.part_discount_cents,
        ],
        labor_discount_cents: [
          ...result.labor_discount_cents,
          repairorder.labor_discount_cents,
        ],
        supply_fee_cents: [
          ...result.supply_fee_cents,
          repairorder.supply_fee_cents,
        ],
        part_discount_percentages: [
          ...result.part_discount_percentages,
          repairorder.part_discount_percentage,
        ],
        part_tax_rates: [...result.part_tax_rates, repairorder.part_tax_rate],
        labor_tax_rates: [
          ...result.labor_tax_rates,
          repairorder.labor_tax_rate,
        ],
        sublet_tax_rates: [
          ...result.sublet_tax_rates,
          repairorder.sublet_tax_rate,
        ],
        hazmat_tax_rates: [
          ...result.hazmat_tax_rates,
          repairorder.hazmat_tax_rate,
        ],
      }),
      {
        ids: [] as number[],
        created_ats: [] as (Date | null)[],
        updated_ats: [] as (Date | null)[],
        numbers: [] as (number | null)[],
        states: [] as (string | null)[],
        customer_ids: [] as (number | null)[],
        part_discount_cents: [] as (number | null)[],
        labor_discount_cents: [] as (number | null)[],
        supply_fee_cents: [] as number[],
        part_discount_percentages: [] as (number | null)[],
        part_tax_rates: [] as (number | null)[],
        labor_tax_rates: [] as (number | null)[],
        sublet_tax_rates: [] as (number | null)[],
        hazmat_tax_rates: [] as (number | null)[],
      },
    );
    await this.db.query(
      `
      INSERT INTO shopwarerepairorder (
        id,
        created_at,
        updated_at,
        number,
        state,
        customer_id,
        part_discount_cents,
        labor_discount_cents,
        supply_fee_cents,
        part_discount_percentage,
        part_tax_rate,
        labor_tax_rate,
        sublet_tax_rate,
        hazmat_tax_rate
      )
      SELECT * FROM UNNEST (
        $1::int[],
        $2::timestamp[],
        $3::timestamp[],
        $4::int[],
        $5::varchar(50)[],
        $6::bigint[],
        $7::int[],
        $8::int[],
        $9::int[],
        $10::int[],
        $11::float[],
        $12::float[],
        $13::float[],
        $14::float[]
      )
      ON CONFLICT (id)
      DO UPDATE
      SET
      id = EXCLUDED.id,
      created_at = EXCLUDED.created_at,
      updated_at = EXCLUDED.updated_at,
      number = EXCLUDED.number,
      state = EXCLUDED.state,
      customer_id = EXCLUDED.customer_id,
      part_discount_cents = EXCLUDED.part_discount_cents,
      labor_discount_cents = EXCLUDED.labor_discount_cents,
      supply_fee_cents = EXCLUDED.supply_fee_cents,
      part_discount_percentage = EXCLUDED.part_discount_percentage,
      part_tax_rate = EXCLUDED.part_tax_rate,
      labor_tax_rate = EXCLUDED.labor_tax_rate,
      sublet_tax_rate = EXCLUDED.sublet_tax_rate,
      hazmat_tax_rate = EXCLUDED.hazmat_tax_rate`,
      [
        repairorders.ids,
        repairorders.created_ats,
        repairorders.updated_ats,
        repairorders.numbers,
        repairorders.states,
        repairorders.customer_ids,
        repairorders.part_discount_cents,
        repairorders.labor_discount_cents,
        repairorders.supply_fee_cents,
        repairorders.part_discount_percentages,
        repairorders.part_tax_rates,
        repairorders.labor_tax_rates,
        repairorders.sublet_tax_rates,
        repairorders.hazmat_tax_rates,
      ],
    );
  }
}
