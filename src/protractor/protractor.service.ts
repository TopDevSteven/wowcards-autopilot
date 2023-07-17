import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ProtractorApiService } from "./api.service";
import { ProtractorContactService } from "./protractor.contact.service";
import { ProtractorInvoiceService } from "./protractor.invoice.service";
import { ProtractorServiceItemService } from "./protrator.serviceitem.service";
import path from "path";

const csvWriter = require("csv-writer");

@Injectable()
export class ProtractorService {
  constructor(
    @Inject("DB_CONNECTION") private readonly db: Pool,
    private readonly protractorapiservice: ProtractorApiService,
    private readonly protractorcontactservice: ProtractorContactService,
    private readonly protractorinvoiceservice: ProtractorInvoiceService,
  ) {}

  async fetchAndwriteEachDateProtractor(
    start_date: string,
    gap: number,
    shop_name: string,
  ) {
    let startDate = new Date(start_date);
    let endDate = new Date();
    const today = new Date();
    endDate = new Date(startDate.getTime());
    endDate.setDate(startDate.getDate() + gap);
    if (endDate >= today) {
      endDate = new Date();
    }
    const end_date = endDate.toISOString().split("T")[0];
    const response = await this.protractorapiservice.fetchProtractor(
      start_date,
      end_date,
    );
    console.log(response);
    console.log(response.CRMDataSet.ServiceItems.Item);
    await this.protractorcontactservice.writeProtractorContactsToDB(
      response.CRMDataSet.Contacts.Item
        ? response.CRMDataSet.Contacts.Item
        : null,
      shop_name,
    );
    await this.protractorinvoiceservice.writeProtractorInvoiesToDB(
      response.CRMDataSet.Invoices.Item
        ? response.CRMDataSet.Invoices.Item
        : null,
    );
  }

  async fetchAndwrtieProtractorToDB(gap: number, shop_name: string) {
    const dates = await this.generativeDateGroup();
    await Promise.all(
      dates.map((date) =>
        this.fetchAndwriteEachDateProtractor(date, gap, shop_name),
      ),
    );
    // console.log(response.CRMDataSet.Contacts.Item)
    // await this.protractorcontactservice.writeProtractorContactsToDB(response.CRMDataSet.Contacts.Item)
  }

  async getProtractorReport(shop_name: string) {
    const res = await this.db.query(
      `
      SELECT DISTINCT c.id,
          to_char(c.creationtime, 'YYYY-MM-DD') as creationtime,
          to_char(c.lastmodifiedtime, 'YYYY-MM-DD') as lastmodifiedtime,
          c.id,
          c.firstname,
          c.middlename,
          c.lastname,
          c.shopname,
          c.suffix,
          c.addresstitle,
          c.addressstreet,
          c.addresscity,
          c.addressprovince,
          c.addresspostalcode,
          c.addresscountry,
          c.company,
          c.phone1title,
          c.phone1,
          c.phone2title,
          c.phone2,
          c.emailtitle,
          c.email,
          c.marketingsource,
          c.note,
          c.nomessaging,
          c.noemail,
          c.nopostCard,
          firstVisit.invoicetime as firstVisitDate,
          lastVisit.invoicetime as lastVisitDate,
          AVG(i.grandtotal) as AROdollar,
          SUM(i.grandtotal) as TotalROdollars,
          COUNT(i.id) as TotalROs,
          b.b_year,
          b.b_month,
          b.b_day
      FROM protractorcontact c
      LEFT JOIN (
          SELECT contactid, MIN(invoicetime) as invoicetime
          FROM protractorinvoice
          WHERE invoicetime IS NOT NULL
          GROUP BY contactid
      ) firstVisit ON firstVisit.contactid = c.id
      LEFT JOIN (
          SELECT contactid, MAX(invoicetime) as invoicetime
          FROM protractorinvoice
          WHERE invoicetime IS NOT NULL
          GROUP BY contactid
      ) lastVisit ON lastVisit.contactid = c.id
      LEFT JOIN protractorinvoice i ON i.contactid = c.id
      LEFT JOIN protractorbday b ON b.customer_id = c.id
      WHERE DATE(lastVisit.invoicetime) >= DATE(NOW() - INTERVAL '4 YEARS 3 MONTHS')
      AND c.shopname='${shop_name}'
      GROUP BY c.id,firstVisit.invoicetime, lastVisit.invoicetime, b.b_year, b.b_month, b.b_day;
      `,
    );

    return res.rows;
  }

  async getCustomers(shop_name: string) {
    const response = await this.db.query(
      `
      SELECT COUNT(DISTINCT c.id) as customers,
      '${shop_name}' as shopname
      FROM protractorcontact c
      WHERE c.shopname = '${shop_name}'
      `,
    );

    return response.rows[0];
  }

  async getLastVisits(
    shop_name: string,
    start_year: number,
    last_year: number,
  ) {
    const response = await this.db.query(
      `
      SELECT
        COUNT(DISTINCT c.id) as lastvisits,
        '${shop_name}' as shopname
      FROM protractorcontact as c
      LEFT JOIN(
        SELECT contactid, MAX(invoicetime) as maxinvoicetime
        FROM protractorinvoice
        GROUP BY contactid
      ) as i ON c.id = i.contactid
      WHERE DATE(maxinvoicetime) >= DATE(NOW() - INTERVAL '${start_year} YEARS')
      AND DATE(maxinvoicetime) < DATE(NOW() - INTERVAL '${last_year} YEARS')
      AND c.shopname = '${shop_name}'
      `,
    );

    return response.rows[0];
  }

  async generativeDateGroup() {
    const today = new Date();
    let startDate = new Date("2019-01-01");
    let endDate = new Date();
    let numofDays = 180;
    let DateGroups = new Array();

    while (startDate <= today) {
      endDate = new Date(startDate.getTime());
      endDate.setDate(startDate.getDate() + numofDays);
      DateGroups.push(startDate.toISOString().split("T")[0]);
      startDate = endDate;
    }

    return DateGroups;
  }

  // async generateReportCSVFile() {
  //   const report = await this.getProtractorReport();
  //   console.log(report);
  //   const writer = csvWriter.createObjectCsvWriter({
  //     path: path.resolve(__dirname, "protractorreport.csv"),
  //     header: [
  //       { id: "id", title: "ID" },
  //       { id: "firstname", title: "First Name" },
  //       { id: "middlename", title: "Middle Name" },
  //       { id: "lastname", title: "Last Name" },
  //       { id: "shopname", title: "Shop Name" },
  //       { id: "addresstitle", title: "Address Title" },
  //       { id: "addressstreet", title: "Address Street" },
  //       { id: "addresscity", title: "Address City" },
  //       { id: "addressprovince", title: "Address Province" },
  //       { id: "addresspostalcode", title: "Address PostalCode" },
  //       { id: "addresscountry", title: "Address Country" },
  //       { id: "company", title: "Company" },
  //       { id: "phone1title", title: "Phone1 Title" },
  //       { id: "phone1", title: "Phone1" },
  //       { id: "phone2title", title: "Phone2 Title" },
  //       { id: "phone2", title: "Phone2" },
  //       { id: "email", title: "Email" },
  //       { id: "marketingsource", title: "Marketing Source" },
  //       { id: "firstvisitdate", title: "First VisitDate" },
  //       { id: "lastvisitdate", title: "Last VisitDate" },
  //       { id: "totalrodollars", title: "Total Invoice $" },
  //       { id: "totalros", title: "Total Invoices" },
  //       { id: "arodollar", title: "Average Invoice $" },
  //     ],
  //   });

  //   await writer.writeRecords(report).then(() => {
  //     console.log("Done!");
  //   });
  // }
}
