import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ConfigService } from "@nestjs/config";
import { TekmetricApiService } from "./api.service";
import { TekmetricSendEmailService } from "./tekmetric.sendemail.service";
import { TekmetricService } from "./tekmetric.service";
import { TekmetricEmployeeService } from "./tekmetric.employee.service";
import { TekmetricCustomerService } from "./tekmetric.customer.service";
import { TekmetricShop } from "./api.service";

type ShopForNotification = {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
};

@Injectable()
export class TekmetricShopService {
  private readonly logger = new Logger(TekmetricShopService.name);
  constructor(
    private configService: ConfigService,
    private readonly apiService: TekmetricApiService,
    private readonly tekmetricmailer: TekmetricSendEmailService,
    private readonly tekservice: TekmetricService,
    private readonly tekemployeeserivce: TekmetricEmployeeService,
    private readonly tekcustomerservice: TekmetricCustomerService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async fetchShopData() {
    const rawTekShops = await this.apiService.fetch<TekmetricShop[]>(`/shops`);
    const connectedShops = rawTekShops.reduce(
      (result, shop) => ({
        ids: [...result.ids, shop.id],
        names: [...result.names, shop.name],
        phones: [...result.phones, shop.phone],
        emails: [...result.emails, shop.email],
        websites: [...result.websites, shop.website],
        status: [...result.status, "Connected"],
      }),
      {
        ids: [] as number[],
        names: [] as (string | null)[],
        phones: [] as (string | null)[],
        emails: [] as (string | null)[],
        websites: [] as (string | null)[],
        status: [] as string[],
      },
    );

    return connectedShops;
  }

  async writeTekShopsToDB() {
    const connectedTekShops = await this.fetchShopData();
    
    await this.db.query(
      `
      INSERT INTO tekshop (
        id,
        name,
        phone,
        email,
        website
      )
        SELECT * FROM UNNEST (
        $1::bigint[],
        $2::varchar(50)[],
        $3::varchar(50)[],
        $4::varchar(50)[],
        $5::varchar(50)[]
      )
        ON CONFLICT (id)
        DO UPDATE
        SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        website = EXCLUDED.website`,
      [
        connectedTekShops.ids,
        connectedTekShops.names,
        connectedTekShops.phones,
        connectedTekShops.emails,
        connectedTekShops.websites
      ]
    )

    await console.log("success")
  }

  // async fetchAndWriteShopData() {
  //   const Tekshops = await this.apiService.fetch<TekmetricShop[]>(`/shops`);
  //   const shops = Tekshops.reduce(
  //     (result, shop) => ({
  //       ids: [...result.ids, shop.id],
  //       names: [...result.names, shop.name],
  //       phones: [...result.phones, shop.phone],
  //       emails: [...result.emails, shop.email],
  //       websites: [...result.websites, shop.website],
  //     }),
  //     {
  //       ids: [] as number[],
  //       names: [] as (string | null)[],
  //       phones: [] as (string | null)[],
  //       emails: [] as (string | null)[],
  //       websites: [] as (string | null)[],
  //     },
  //   );

  //   const original_shops = await this.db.query(
  //     `
  //     SELECT * FROM tekshop
  //     `,
  //   );
  //   //  Extracting the new Shops and old Shops and Sending to email using Outh.
  //   const oldShopidsSet = new Set(
  //     original_shops.rows.map((shop) => Number(shop.id)),
  //   );
  //   const newShopidsSet = new Set(shops.ids);
  //   const newShops = Tekshops.filter((shop) => !oldShopidsSet.has(shop.id));
  //   const oldShops = original_shops.rows.filter(
  //     (shop) => !newShopidsSet.has(Number(shop.id)),
  //   );
  //   const oldShopInfo = await Promise.all(
  //     oldShops.map((shop) => this.getShopSInfoForNotification(shop, false)),
  //   );

  //   await this.db.query(
  //     `
  //     DELETE FROM tekshop
  //     `,
  //   );

  //   await this.db.query(
  //     `
  //       INSERT INTO tekshop (
  //         id,
  //         name,
  //         phone,
  //         email,
  //         website
  //       )
  //       SELECT * FROM UNNEST (
  //         $1::bigint[],
  //         $2::varchar(50)[],
  //         $3::varchar(50)[],
  //         $4::varchar(50)[],
  //         $5::varchar(50)[]
  //       )
  //       ON CONFLICT (id)
  //       DO UPDATE
  //       SET
  //       name = EXCLUDED.name,
  //       phone = EXCLUDED.phone,
  //       email = EXCLUDED.email,
  //       website = EXCLUDED.website`,
  //     [shops.ids, shops.names, shops.phones, shops.emails, shops.websites],
  //   );

  //   await Promise.all(oldShops.map((shop) => this.deleteOldRecord(shop.id)));

  //   if (newShops.length != 0) {
  //     await Promise.all(
  //       newShops.map((shop) =>
  //         this.tekcustomerservice.fetchAndWriteCustomerData(shop.id),
  //       ),
  //     );

  //     await Promise.all(
  //       newShops.map((shop) =>
  //         this.tekemployeeserivce.fetchAndWriteEmployee(shop.id),
  //       ),
  //     );
  //   }

  //   const send_new_shop = await Promise.all(
  //     newShops.map((shop) => this.getShopSInfoForNotification(shop, true)),
  //   );

  //   const notify_shops = send_new_shop.concat(oldShopInfo);

  //   await this.tekmetricmailer.sendEmail(notify_shops);
  // }

  // async getShopSInfoForNotification(shop: ShopForNotification, flag: boolean) {
  //   const now = new Date();
  //   const nowDate = now.toISOString().split("T")[0];
  //   const nowLocalTime = now.toLocaleString("en-US", {
  //     timeZone: "America/New_York",
  //   });
  //   const nowTime = nowLocalTime.split(", ")[1];
  //   const timeContent = `${nowDate} ${nowTime} (EST)`;
  //   const ownerInfor = await this.tekservice.getOwners(shop.id);
  //   const customerCount = await this.tekservice.getCustomerCount(shop.id);

  //   return {
  //     shopname: shop.name,
  //     status: flag ? "Connected" : "Disconnected",
  //     date: nowDate,
  //     shopwebsite: shop.website,
  //     shopphone: shop.phone,
  //     ownerFirstName: ownerInfor.length != 0 ? ownerInfor[0].firstname : null,
  //     ownerLastName: ownerInfor.length != 0 ? ownerInfor[0].lastname : null,
  //     ownerEmail: ownerInfor.length != 0 ? ownerInfor[0].email : null,
  //     customerCounts:
  //       ownerInfor.length != 0 ? customerCount[0].customercount : null,
  //     software: "Tekmetric",
  //   };
  // }

  // async deleteOldRecord(shop_id: number) {
  //   await this.db.query(
  //     `
  //     DELETE FROM tekcustomer
  //     WHERE  shopid = ${shop_id}
  //     `,
  //   );

  //   await this.db.query(
  //     `
  //     DELETE FROM tekemployee
  //     WHERE shpid = ${shop_id}
  //     `,
  //   );
  // }
}
