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

@Injectable()
export class ShopwareShopService {
  private readonly logger = new Logger(ShopwareShopService.name);
  constructor(
    private configService: ConfigService,
    private readonly apiService: ShopWareApiService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async fetchShopData(tanent_id: number) {
    const res = await this.apiService.fetch<ShopwareData>(
      `/tenants/${tanent_id}/shops`,
    );
    return res.results;
  }

  async writeShopsToDB(tanent_id: number) {
    const shopwareShops: ShopWareShop[] = await this.fetchShopData(tanent_id)
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
}
