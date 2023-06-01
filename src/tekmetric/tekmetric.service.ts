import {
  ClassSerializerInterceptor,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Pool } from "pg";
import { ConfigService } from "@nestjs/config";
import { TekmetricApiService } from "./api.service";
const csvWriter = require("csv-writer");
import path from "path";

// const shopIds = [
// '1',    '155',  '188',  '293',
//   '309',  '331',
//   '377',  '398',  '508',  '545',  '572',  '589',
//   '1008', '1079', '1112', '1159', '1213', '1216',
//   '1218', '1342', '1380', '1398', '1552', '1667',
//   '1692', '1873', '2172', '2305', '2442', '2905',
//   '3028', '3229', '3253', '3302', '3341', '3343',
//   '3351', '3385', '3472', '3520', '3539', '3540',
//   '3541', '3542', '3543', '3547', '3586', '3690',
//   '3707', '3747', '3758', '3759', '3761', '4120',
//   '4299', '4406', '4494', '4929', '5095', '5096',
//   '5097', '5652', '5803'
// ]

const shopIds = ["888"];

@Injectable()
export class TekmetricService {
  private readonly logger = new Logger(TekmetricService.name);
  constructor(
    private configService: ConfigService,
    private readonly apiService: TekmetricApiService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  // database quering
  async getMigraionDate(shopId: Number) {
    const response = await this.db.query(
      `
      SELECT c.shopId , to_char(c.createdDate, 'YYYY-MM-DD')  migrationDate, COUNT(DATE(c.createdDate)) as count
      FROM tekcustomer c
      WHERE c.shopId = ${shopId}
      GROUP BY c.shopId, migrationDate
      ORDER BY count DESC LIMIT 1
      `,
    );
    
    return response.rows[0];
  }

  async getFirstVisitDate(shopId: Number) {
    const response = await this.db.query(
      `
      SELECT to_char(MIN(j.authorizedDate), 'YYYY-MM-DD') as firstvisitdate, 
        ${shopId} as shopid
      FROM tekjob as j 
      LEFT JOIN tekcustomer c ON j.customerid = c.id 
      WHERE c.shopID = ${shopId}
      `
    )

    return response.rows[0]
  }

  async getUpdatedDate(shopId: Number) {
    const response = await this.db.query(
      `
      SELECT to_char(MAX(DATE(c.updatedDate)), 'YYYY-MM-DD')  updatedDate FROM tekcustomer c 
      WHERE c.shopId = ${shopId}
      `,
    );

    return response.rows;
  }

  async getCustomerCount(shopId: Number) {
    const response = await this.db.query(
      `
      SELECT COUNT(distinct c.id) as customerCount,
      c.shopId as shopid
      FROM tekcustomer c
      WHERE
        c.shopId =  ${shopId}
        AND c.customerType_code = 'PERSON'
        AND c.okForMarketing = true
      GROUP BY c.shopId
      `,
    );

    return response.rows[0];
  }

  async getJobsWithAuthorizedDateCount(shopId: Number, firstYear: Number, lastYear: Number) {
    const response = await this.db.query(
      `
      SELECT 
        COUNT(distinct c.id) as jobsWithAuthorizedDateCount,
        ${shopId} as shopId
      FROM tekcustomer as c
      LEFT JOIN (
        SELECT customerid, MAX(authorizedDate) as maxAuthorizedDate
        FROM tekjob
        GROUP BY customerid
      ) as j ON c.id = j.customerid
      WHERE c.customerType_code = 'PERSON'
        AND c.okForMarketing = true
        AND DATE(j.maxAuthorizedDate) >= DATE(NOW() - INTERVAL '${firstYear} YEARS')
        AND DATE(j.maxAuthorizedDate) < DATE(NOW() - INTERVAL '${lastYear} YEARS')
        AND c.shopId = ${shopId};
      `,
    );

    return response.rows[0];
  }

  async getShops(shopId: Number) {
    const response = await this.db.query(
      `
      SELECT
        s.id as id,
        s.name as name,
        s.email as email,
        s.website as website,
        s.phone as phone
      FROM tekshop as s
      WHERE
      s.id = ${shopId};
      `,
    );

    return response.rows;
  }

  async getOwners(shopId: number) {
    const response = await this.db.query(
      `
      SELECT
        e.id as id,
        e.firstname as firstname,
        e.lastname as lastname,
        e.email as email,
        e.address1 as address1,
        e.address2 as address2,
        e.city as city,
        e.state as state,
        e.zip as zip,
        e.fulladdress as fulladdress,
        e.streetaddress as streetaddress,
        e.shpid as shopid
      FROM tekemployee as e
      WHERE
        e.shpid = ${shopId}
        AND e.type = 'OWNER'
      `,
    );

    return response.rows[0];
  }

  // async getTekmetricEachShopDashboard(shopId: number) {
  //   const jobAuthDateCount = await this.getJobsWithAuthorizedDateCount(shopId);
  //   const shopinfo = await this.getShops(shopId);
  //   const customerCount = await this.getCustomerCount(shopId);
  //   const updatedDate = await this.getUpdatedDate(shopId);
  //   const migrationDate = await this.getMigraionDate(shopId);

  //   return {
  //     jobauthorizedDate: jobAuthDateCount[0].jobswithauthorizeddatecount,
  //     shopId: migrationDate[0].shopid,
  //     shopname: shopinfo[0].name,
  //     shopemail: shopinfo[0].email,
  //     shopwebsite: shopinfo[0].website,
  //     shopphone: shopinfo[0].phone,
  //     migraionDate: migrationDate[0].migrationdate,
  //     updatedDate: updatedDate[0].updateddate,
  //     customerCount: customerCount[0].customercount,
  //   };
  // }

  // async getTekmetricShopDashboard() {
  //   const res = await Promise.all(
  //     shopIds.map((id) => this.getTekmetricEachShopDashboard(Number(id))),
  //   );
  //   return res;
  // }

  async getTeckmetricReport() {
    const response = await this.db.query(
      `
      WITH min_date AS (
        SELECT MIN(j.authorizedDate) AS first_date 
        FROM tekjob as j 
        WHERE j.authorizedDate >= DATE(NOW() - INTERVAL '4 years 3 months')
      ),
      week_groups AS (
          SELECT 
              (date(j.authorizedDate) - date((SELECT first_date FROM min_date))) / 7 AS week_group,
              j.customerId,
              COUNT(*) as total_jobs
          FROM 
              tekjob as j 
          WHERE j.authorizedDate >= DATE(NOW() - INTERVAL '4 years 3 months')
          GROUP BY 
              week_group, j.customerId
      ),
      customer_week_groups AS (
          SELECT
              customerId,
              COUNT(*) as total_week_groups
          FROM
              week_groups
          WHERE
              total_jobs > 0
          GROUP BY
              customerId
      )
      SELECT 
          c.id,
          cw.total_week_groups,
          TRIM(c.firstName) as firstName,
          TRIM(c.lastName) as lastName,
          TRIM(c.address1) as address1,
          TRIM(c.address2) as address2,
          TRIM(c.phone1) as phone1,
          TRIM(c.phone2) as phone2,
          TRIM(c.phone3) as phone3,
          TRIM(c.customertype_code) as customertype_code,
          c.shopId as storeId,
          c.id as customerId,
          TRIM(c.email) as email,
          to_char(c.birthday, 'YYYY-MM-DD') birthday,
          (SELECT to_char(j.authorizedDate, 'YYYY-MM-DD') FROM tekjob j WHERE j.customerId = c.id ORDER BY j.authorizedDate DESC NULLS LAST LIMIT 1) as jobAuthLast,
          (SELECT to_char(j.authorizedDate, 'YYYY-MM-DD') FROM tekjob j WHERE j.customerId = c.id ORDER BY j.authorizedDate ASC LIMIT 1) as jobAuthFirst,
          to_char(c.updatedDate, 'YYYY-MM-DD') as updatedDate,
          to_char(c.createdDate, 'YYYY-MM-DD') as createdDate,
          to_char(c.deletedDate, 'YYYY-MM-DD') as deletedDate,
          CASE WHEN c.okForMarketing=true THEN 'Y' ELSE 'N' END as okForMarketing,
          TRIM(c.address_city) as city,
          TRIM(c.address_state) as state,
          TRIM(c.address_zip) as zip,
          (SELECT ROUND(SUM(r.amountpaid)/100, 2) FROM tekrepairorder r WHERE r.customerid = c.id and r.posteddate IS NOT NULL) as totalsales,
          (SELECT COUNT(r.id) FROM tekrepairorder r WHERE r.customerId = c.id and r.posteddate IS NOT NULL) as totalroquantity,
          (SELECT ROUND(AVG(r.amountpaid)/100, 2) FROM tekrepairorder r WHERE r.customerid = c.id and r.posteddate IS NOT NULL) as aro,
          (SELECT ROUND(SUM(r.amountpaid)/100, 2) FROM tekrepairorder r WHERE r.customerid = c.id and r.posteddate IS NOT NULL and DATE(r.posteddate) >= DATE(NOW() - INTERVAL '4 YEARS 3 MONTHS')) as sales51mons,
          (SELECT COUNT(r.id) FROM tekrepairorder r WHERE r.customerId = c.id and r.posteddate IS NOT NULL and DATE(r.posteddate) >= DATE(NOW() - INTERVAL '4 YEARS 3 MONTHS')) as roquantity51mons,
          (SELECT ROUND(AVG(r.amountpaid)/100, 2) FROM tekrepairorder r WHERE r.customerid = c.id and r.posteddate IS NOT NULL and DATE(r.posteddate) >= DATE(NOW() - INTERVAL '4 YEARS 3 MONTHS')) as aro51mons,
          (SELECT COUNT(j.id) FROM tekjob j WHERE j.customerId = c.id and j.authorizedDate >= DATE(NOW() - INTERVAL '4 YEARS 3 MONTHS')) as jobauth51mons
      FROM 
          tekcustomer as c
      JOIN 
          customer_week_groups as cw ON c.id = cw.customerId
      WHERE (SELECT DATE(j.authorizedDate) FROM tekjob j WHERE j.customerId = c.id ORDER BY j.authorizedDate DESC NULLS LAST LIMIT 1 ) >= DATE(NOW() - INTERVAL '4 YEARS 3 MONTHS')
          AND c.shopid in (5803)
          AND c.customertype_code = 'PERSON'
      ORDER BY c.shopId , jobAuthLast
      `,
    );

    return response.rows;
  }

  // generating the CSV dashboards

  async generateReportCSVFile() {
    const report = await this.getTeckmetricReport();

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "countries.csv"),
      header: [
        { id: "firstname", title: "First Name" },
        { id: "lastname", title: "Last Name" },
        { id: "address1", title: "Address1" },
        { id: "address2", title: "Address2" },
        { id: "state", title: "Address State" },
        { id: "zip", title: "Address Zip" },
        { id: "city", title: "Address City" },
        { id: "storeid", title: "ShopId" },
        { id: "jobauthlast", title: "JobAuthLast" },
        { id: "jobauthfirst", title: "JobAuthFirst" },
        { id: "createddate", title: "Created Date" },
        { id: "updateddate", title: "Updated Date" },
        { id: "deleteddate", title: "Deleted Date" },
        { id: "customerid", title: "Customer Id" },
        { id: "email", title: "Email" },
        { id: "phone1", title: "Phone1" },
        { id: "phone2", title: "Phone2" },
        { id: "phone3", title: "Phone3" },
        { id: "customertype_code", title: "Type" },
        { id: "birthday", title: "Birthdate" },
        { id: "okformarketing", title: "OkForMarketing" },
        { id: "totalsales", title: "RO$" },
        { id: "totalroquantity", title: "ROs" },
        { id: "aro", title: "ARO" },
        { id: "sales51mons", title: "RO$ 51mo" },
        { id: "roquantity51mons", title: "ROs 51mo" },
        { id: "aro51mons", title: "ARO 51" },
        { id: "total_week_groups", title: "JobAuth51ADJ" },
        { id: "jobauth51mons", title: "JobAuth51All" },
      ],
    });

    console.log(report);

    await writer.writeRecords(report).then(() => {
      console.log("Done!");
    });
  }

  // async generateDashboardCSVFile() {
  //   const dashboard = await this.getTekmetricShopDashboard();
  //   const writer = csvWriter.createObjectCsvWriter({
  //     path: path.resolve(__dirname, "dashboard.csv"),
  //     header: [
  //       { id: "jobauthorizedDate", title: "jobs.authorizedDate" },
  //       { id: "shopId", title: "shopId" },
  //       { id: "migraionDate", title: "migrationDate" },
  //       { id: "shopname", title: "shopName" },
  //       { id: "shopphone", title: "phone" },
  //       { id: "shopemail", title: "email" },
  //       { id: "shopwebsite", title: "website" },
  //       { id: "customerCount", title: "customerCount" },
  //       { id: "updatedDate", title: "updatedDate" },
  //     ],
  //   });

  //   await writer.writeRecords(dashboard).then(() => {
  //     console.log("Done!");
  //   });
  // }
}
