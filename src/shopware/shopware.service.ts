import { Header, Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ConfigService } from "@nestjs/config";
import { ShopWareApiService } from "./api.service";
const csvWriter = require("csv-writer");
import path from "path";

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

  async getSWReport(tanent_id: number, shop_id: number) {
    const res = await this.db.query(
      `
      SELECT 
      c.id,
      c.first_name,
      c.last_name, 
      c.phone,
      c.address,
      c.city,
      c.state,
      c.zip,
      c.shopid,
      c.originshopid,
      c.tenant,
      b.b_year,
      b.b_month,
      b.b_day,
      r.maxupdated_date,
      s.shopware_shop_id,
      s.name,
      s.phone,
      s.email
      FROM shopwarecustomer c
      LEFT JOIN (
        SELECT customer_id, MAX(updated_at) as maxupdated_date
        FROM shopwarerepairorder
        GROUP BY customer_id
      ) as r ON c.id = r.customer_id
      LEFT JOIN shopwareshop s ON c.shopid = s.shopware_shop_id
      LEFT JOIN shopwarebday b ON CAST(b.customer_id AS INTEGER) = c.id
      WHERE r.maxupdated_date >= DATE(NOW() - INTERVAL '4 YEARS 3 MONTHS')
      AND c.tenant = ${tanent_id} and c.shopid = ${shop_id}
      `,
    );

    return res.rows;
  }

  async generateSwReportCSV(tanent_id: number) {
    const customers = await this.getSWReport(tanent_id, 0);
    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "./csvFiles/SWReport.csv"),
      header: [
        { id: "first_name", title: "First Name" },
        { id: "last_name", title: "Last Name" },
        { id: "phone", title: "Phone" },
        { id: "address", title: "Address" },
        { id: "city", title: "City" },
        { id: "state", title: "State" },
        { id: "zip", title: "ZIP" },
        { id: "shopid", title: "Shop Id" },
        { id: "originshopid", title: "Origin Shop ID" },
        { id: "tenant", title: "Tenant ID" },
      ],
    });

    await writer.writeRecords(customers).then(() => {
      console.log("Done!");
    });
  }
}
