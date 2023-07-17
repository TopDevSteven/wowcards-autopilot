import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import * as fs from 'fs';
import csv from 'csv-parser';

type ProBdayObject = {
    'storeName': string;
    'Cust ID': string;
    'YEAR': string | null;
    'MONTH': string | null;
    'DAY': string | null;
}

@Injectable()
export class ProtractorBdayService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}



    async parseMergedCsvfile(filePath: string): Promise<ProBdayObject[]> {
        const results: any = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data',(data: {'SoftWare': string, 'Shop Name': string; 'Customer ID': string; 'OK YEAR': string, 'OK MONTH': string }) => {
                    if (data['SoftWare'].trim() === 'Pr') {
                    results.push({ storeName: data['Shop Name'].replace('?????????', '-'), 'Cust ID': data['Customer ID'], YEAR: data['OK YEAR'],  MONTH: data['OK MONTH'], DAY: ""});
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

    async parseCsvFile(filePath: string): Promise<ProBdayObject[]> {
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

    async writeBdayToDB(bday: ProBdayObject[]) {
        const proBday = bday.reduce(
            (result, day) => ({
                ids: [...result.ids, day['Cust ID']],
                storenames: [...result.storenames, day['storeName']],
                year: [...result.year, day['YEAR']],
                month: [...result.month, day['MONTH']],
                day: [...result.day, day['DAY']]
            }),
            {
                ids: [] as string [],
                storenames: [] as string [],
                year: [] as (string | null) [],
                month: [] as (string | null) [],
                day: [] as (string | null) []
            }
        )

        await this.db.query(
            `CREATE TEMP TABLE temp_table (customer_id varchar(50), shopname varchar(50), b_year varchar(50), b_month varchar(50), b_day varchar(50));`
        );
        
        // Insert data into the temporary table
        await this.db.query(
            `INSERT INTO temp_table (customer_id, shopname, b_year, b_month, b_day)
            SELECT * FROM UNNEST ($1::varchar(50)[], $2::varchar(50)[], $3::varchar(50)[], $4::varchar(50)[], $5::varchar(50)[])`,
            [
                proBday.ids,
                proBday.storenames,
                proBday.year,
                proBday.month,
                proBday.day
            ]
        );
        
        // Now, insert data from the temporary table into the main table, resolving any conflicts
        await this.db.query(
            `INSERT INTO protractorbday (customer_id, shopname, b_year, b_month, b_day)
            SELECT DISTINCT ON (customer_id) customer_id, shopname, b_year, b_month, b_day FROM temp_table
            ON CONFLICT (customer_id) DO UPDATE SET shopname = EXCLUDED.shopname, b_year = EXCLUDED.b_year, b_month = EXCLUDED.b_month, b_day = EXCLUDED.b_day;`
        );
        
        // Finally, drop the temporary table
        await this.db.query(
            `DROP TABLE temp_table;`
        );
    
        await console.log("Done!!!")
    }
}
