import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import * as fs from "fs";
import csv from "csv-parser";

type SWBdayObject = {
  storeId: string | null;
  tanentID: string;
  customerId: string;
  Year: string | null;
  Month: string | null;
  Day: string | null;
};

const SWID: Record<string, string[]> = {
  "3065": ["5370", "2955", "2954"],
  "4186": ["4200"],
  "2654": ["2507"],
};

// : Promise<BdayObject[]>

@Injectable()
export class SWBdayService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

  getKeyByValue(
    obj: Record<string, string[]>,
    value: string,
  ): string | undefined {
    return Object.keys(obj).find((key) => obj[key].includes(value));
  }

  async parseMergedCsvfile(filePath: string): Promise<SWBdayObject[]> {
    const results: any = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on(
          "data",
          (data: {
            Software: string;
            "Shop Id": string;
            "Customer ID": string;
            "OK YEAR": string;
            "OK MONTH": string;
          }) => {
            if (data["Software"].trim() === "SW") {
              const tenant_id: string | undefined = this.getKeyByValue(
                SWID,
                data["Shop Id"],
              );
              results.push({
                storeId: data["Shop Id"],
                tanentID: tenant_id,
                customerId: data["Customer ID"],
                Year: data["OK YEAR"],
                Month: data["OK MONTH"],
                Day: "",
              });
            }
          },
        )
        .on("end", () => {
          resolve(results);
        })

        .on("error", (error) => {
          reject(error);
        });
    });
  }

  async writeBdayToDB(bday: SWBdayObject[]) {
    const swBday = bday.reduce(
      (result, day) => ({
        ids: [...result.ids, day["customerId"]],
        tanentIds: [...result.tanentIds, day["tanentID"]],
        shopids: [...result.shopids, day["storeId"]],
        years: [...result.years, day["Year"]],
        months: [...result.months, day["Month"]],
        days: [...result.days, day["Day"]],
      }),
      {
        ids: [] as string[],
        tanentIds: [] as string[],
        shopids: [] as (string | null)[],
        years: [] as (string | null)[],
        months: [] as (string | null)[],
        days: [] as (string | null)[],
      },
    );

    await this.db.query(
      `CREATE TEMP TABLE temp_table_sw (customer_id varchar(50),tanentids varchar(50), shopids varchar(50), b_year varchar(50), b_month varchar(50), b_day varchar(50));`,
    );

    await this.db.query(
      `INSERT INTO temp_table_sw (customer_id, tanentids, shopids, b_year, b_month, b_day)
             SELECT * FROM UNNEST ($1::varchar(50)[], $2::varchar(50)[], $3::varchar(50)[], $4::varchar(50)[], $5::varchar(50)[], $6::varchar(50)[])`,
      [
        swBday.ids,
        swBday.tanentIds,
        swBday.shopids,
        swBday.years,
        swBday.months,
        swBday.days,
      ],
    );

    await this.db.query(
      `INSERT INTO shopwarebday (customer_id, shopid, tanentid, b_year, b_month, b_day)
             SELECT DISTINCT ON (customer_id) customer_id, shopids, tanentids, b_year, b_month, b_day FROM temp_table_sw
             ON CONFLICT (customer_id) DO UPDATE SET shopid = EXCLUDED.shopid, tanentid = EXCLUDED.tanentid, b_year = EXCLUDED.b_year, b_month = EXCLUDED.b_month, b_day = EXCLUDED.b_day;`,
    );

    await this.db.query("DROP TABLE temp_table_sw;");

    await console.log("DONE!!!");
  }

  // async getBdayrecords () {
  //     const  res1 = await this.db.query(`
  //         SELECT
  //             tb.b_year
  //         FROM tekmetricbday tb
  //     `)

  //     const res2 = await this.db.query(`
  //         SELECT
  //             sb.b_year
  //         FROM shopwarebday sb
  //     `)

  //     const res3 = await this.db.query(`
  //         SELECT
  //             pb.b_year
  //         FROM protractorbday pb
  //     `)

  //     const clean1 = res1.rows.filter(item => item.b_year.trim() !== "")
  //     const clean2 = res2.rows.filter(item => item.b_year.trim() !== "")
  //     const clean3 = res3.rows.filter(item => item.b_year.trim() !== "")

  //     return (clean1.length + clean2.length + clean3.length)

  //     // return (res1.rows.length + res2.rows.length + res3.rows.length)
  // }
}
