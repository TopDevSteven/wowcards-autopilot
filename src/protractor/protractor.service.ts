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

  async fetchAndwriteEachDateProtractor(start_date: string) {
    let startDate = new Date(start_date);
    let endDate = new Date();
    const today = new Date();
    endDate = new Date(startDate.getTime());
    endDate.setDate(startDate.getDate() + 180);
    if (endDate >= today) {
      endDate = new Date();
    }
    const end_date = endDate.toISOString().split("T")[0];
    const response = await this.protractorapiservice.fetchProtractor(
      start_date,
      end_date,
    );
    console.log(response.CRMDataSet);
    await this.protractorcontactservice.writeProtractorContactsToDB(
      response.CRMDataSet.Contacts.Item
        ? response.CRMDataSet.Contacts.Item
        : null,
    );
    await this.protractorinvoiceservice.writeProtractorInvoiesToDB(
      response.CRMDataSet.Invoices.Item
        ? response.CRMDataSet.Invoices.Item
        : null,
    );
  }

  async fetchAndwrtieProtractorToDB() {
    const dates = await this.generativeDateGroup();
    await Promise.all(
      dates.map((date) => this.fetchAndwriteEachDateProtractor(date)),
    );
    // console.log(response.CRMDataSet.Contacts.Item)
    // await this.protractorcontactservice.writeProtractorContactsToDB(response.CRMDataSet.Contacts.Item)
  }

  async getProtractorReport() {
    const response = await this.db.query(
      `
      SELECT DISTINCT (id), 
      to_char(c.creationtime, 'YYYY-MM-DD') as creationtime, 
      to_char(c.lastmodifiedtime, 'YYYY-MM-DD') as lastmodifiedtime,
      c.firstname as firstname, 
      c.middlename as middlename, 
      c.lastname as lastname,
      'Sours VA' as shopname,
      c.suffix as suffix,
      c.addresstitle as addresstitle, 
      c.addressstreet as addressstreet, 
      c.addresscity as addresscity, 
      c.addressprovince as addressprovince,
      c.addresspostalcode as addresspostalcode, 
      c.addresscountry as addresscountry,
      c.company as company, 
      c.phone1title as phone1title, 
      c.phone1 as phone1, 
      c.phone2title as phone2title, 
      c.phone2 as phone2, 
      c.emailtitle as emailtitle, 
      c.email as email,
      c.marketingsource as marketingsource, 
      c.note as note, 
      c.nomessaging as nomessaging, 
      c.noemail as noemail, 
      c.nopostCard as nopostcard,
      (SELECT to_char(i.invoicetime, 'YYYY-MM-DD') FROM protractorinvoice i WHERE i.contactid = c.id ORDER BY i.invoicetime ASC LIMIT 1) as firstVisitDate,
      (SELECT to_char(i.invoicetime, 'YYYY-MM-DD') FROM protractorinvoice i WHERE i.contactid = c.id ORDER BY i.invoicetime DESC LIMIT  1) as lastVisitDate,
      (SELECT AVG(i.grandtotal) FROM protractorinvoice i WHERE i.contactid = c.id and i.invoicetime IS NOT NULL) as AROdollar,
      (SELECT SUM(i.grandtotal) FROM protractorinvoice i WHERE i.contactid = c.id and i.invoicetime IS NOT NULL) as TotalROdollars,
      (SELECT COUNT(i.id) FROM protractorinvoice i WHERE i.contactid = c.id and i.invoicetime IS NOT NULL) as TotalROs
      FROM protractorcontact c
      WHERE (SELECT i.invoicetime FROM protractorinvoice i WHERE i.contactid = c.id ORDER BY i.invoicetime DESC LIMIT 1) >= Date('2020-01-01')
      `,
    );

    return response.rows;
  }

  async generativeDateGroup() {
    const today = new Date();
    let startDate = new Date("2020-01-01");
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

  async generateReportCSVFile() {
    const report = await this.getProtractorReport();
    console.log(report);
    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "protractorreport.csv"),
      header: [
        { id: "id", title: "ID" },
        { id: "firstname", title: "First Name" },
        { id: "middlename", title: "Middle Name" },
        { id: "lastname", title: "Last Name" },
        { id: "shopname", title: "Shop Name" },
        { id: "addresstitle", title: "Address Title" },
        { id: "addressstreet", title: "Address Street" },
        { id: "addresscity", title: "Address City" },
        { id: "addressprovince", title: "Address Province" },
        { id: "addresspostalcode", title: "Address PostalCode" },
        { id: "addresscountry", title: "Address Country" },
        { id: "company", title: "Company" },
        { id: "phone1title", title: "Phone1 Title" },
        { id: "phone1", title: "Phone1" },
        { id: "phone2title", title: "Phone2 Title" },
        { id: "phone2", title: "Phone2" },
        { id: "email", title: "Email" },
        { id: "marketingsource", title: "Marketing Source" },
        { id: "firstvisitdate", title: "First VisitDate" },
        { id: "lastvisitdate", title: "Last VisitDate" },
        { id: "totalrodollars", title: "Total Invoice $" },
        { id: "totalros", title: "Total Invoices" },
        { id: "arodollar", title: "Average Invoice $" },
      ],
    });

    await writer.writeRecords(report).then(() => {
      console.log("Done!");
    });
  }
}
