import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import * as fs from 'fs';
import csv from 'csv-parser';

type TekBdayObject = {
    'storeId': string;
    'customerId': string;
    'Year': string | null;
    'Month': string | null;
    'Day': string | null;
}

// : Promise<BdayObject[]>

@Injectable()
export class TekBdayService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

    async mergedTekDay() {
        const res1 = await this.parseCsvFile('./Bdayfiles/Tekmertic__81,383_BDAY_Year_Month_Day.csv')
        const res2 = await this.parseMergedCsvfile('./Bdayfiles/wow_June_23_-_merged_Final.csv')

        return [...res1, ...res2]
    }

    async parseMergedCsvfile(filePath: string): Promise<TekBdayObject[]> {
        const results: any = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data',(data: {'SoftWare': string, 'Shop Id': string; 'Customer ID': string; 'OK YEAR': string, 'OK MONTH': string }) => {
                    if (data['SoftWare'].trim() === 'tekmetric') {
                      results.push({ storeId: data['Shop Id'], customerId: data['Customer ID'], Year: data['OK YEAR'],  Month: data['OK MONTH'], Day: ""});
                    }
                  })
                .on('end', () => {
                    resolve(results);
                })

                .on('error', (error) => {
                    reject(error);
                    }
                )
        })
    }

    async parseCsvFile(filePath: string): Promise<TekBdayObject[]> {
        const results: any = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    async writeBdayToDB(bday: TekBdayObject []) {
        const tekBday = bday.reduce(
            (result, day) => ({
                ids: [...result.ids, day['customerId']],
                storeids: [...result.storeids, day['storeId']],
                year: [...result.year, day['Year']],
                month: [...result.month, day['Month']],
                day: [...result.day, day['Day']]
            }),
            {
                ids: [] as string [],
                storeids: [] as string [],
                year: [] as (string | null) [],
                month: [] as (string | null) [],
                day: [] as (string | null) []
            }
        )

        await this.db.query(
            `CREATE TEMP TABLE temp_table_tek (customer_id varchar(50), shopids varchar(50), b_year varchar(50), b_month varchar(50), b_day varchar(50));`
        );
        
        // Insert data into the temporary table
        await this.db.query(
            `INSERT INTO temp_table_tek (customer_id, shopids, b_year, b_month, b_day)
            SELECT * FROM UNNEST ($1::varchar(50)[], $2::varchar(50)[], $3::varchar(50)[], $4::varchar(50)[], $5::varchar(50)[])`,
            [
                tekBday.ids,
                tekBday.storeids,
                tekBday.year,
                tekBday.month,
                tekBday.day
            ]
        );
        
        // Now, insert data from the temporary table into the main table, resolving any conflicts
        await this.db.query(
            `INSERT INTO tekmetricbday (customer_id, shopids, b_year, b_month, b_day)
            SELECT DISTINCT ON (customer_id) customer_id, shopids, b_year, b_month, b_day FROM temp_table_tek
            ON CONFLICT (customer_id) DO UPDATE SET shopids = EXCLUDED.shopids, b_year = EXCLUDED.b_year, b_month = EXCLUDED.b_month, b_day = EXCLUDED.b_day;`
        );
        
        // Finally, drop the temporary table
        await this.db.query(
            `DROP TABLE temp_table_tek;`
        );
    
        await console.log("Done!!!")
    }
}
