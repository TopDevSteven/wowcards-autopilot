import { Injectable } from "@nestjs/common";
import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";
import { TekmetricShopService } from "../tekmetric/tekmetric.shop.service";
import { TekmetricApiService } from "../tekmetric/api.service";
import { TekmetricShop } from "../tekmetric/api.service";
import { TekmetricService } from "../tekmetric/tekmetric.service";
import { ProtractorService } from "../protractor/protractor.service";

@Injectable()
export class GooglesheetService {
  private sheets: sheets_v4.Sheets;

  constructor(
    private readonly tekmetricShopService: TekmetricShopService,
    private readonly tekmetricApiService: TekmetricApiService,
    private readonly tekmetricService: TekmetricService,
    private readonly protractorService: ProtractorService,
  ) {
    const client = new JWT({
      email: "wowcards@wowcardsproject.iam.gserviceaccount.com",
      key: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwOeWhCXSuXYR5\nyZXr8K1lByMSMXzuQerrJUT8qCehPQHHc+8PfBVeVNlw68UQPdUc3cVP4oD/VNiC\nZbZCEHHXj7hSsF2k04mIMx3KBfQd9ZNHDrwcqnKbMZwvOIcbpCyxtgIxXvh6q8Vh\nGBC4bk37J2TmuFAvLykQWrY2kk+2A+SrDgfQCg7EMAibq1spo6GSAJdGANjRWby0\nNSGao9+8EJZcVhedEqJnvbAG28krMD7EGVy5GQts6dhurYJWpGba4nlde4CEmfj5\nLYtPsBvKtuVrwQb8I1oldpYGIh6in4c30cjc8sCmCXQMIQAaUp4JP4mZilo8SkVi\nQ03MORr5AgMBAAECggEAAwksTIbmLK7Nvm9bltHxmsDxuLmDhnM6QczFkHixHhT3\n9+CmaKThlVtu14QoQ+xcxH+Ji6PCRyPGCxEHf8HaxDTknwAMzO8b+m2vALDzkKSP\nYfT+BpxlFwlWwHV/1lkQsAsLpKAXNb3Jy69nclXsH/yAv3zDXNy6H18ArpX8q40E\nPo8Z/xaTy7yR86fRdSpROrJAIbvWLCMh4XrIOBH5tilxBloKye2gfbkPlfwOF1SY\nYlHq9InCQy2I/9cta0n85gVDI80cxVOtw7VQR0nNvgyz1aYLidOqgnkhA8BOT+jR\n+5hs9rMxeNk2O4mQGzeWtLF2nGvD0FCeVzipgMragQKBgQDweDh/7GbAY6zQYOJP\noic680zEKJWcNCulw6IuYhfsabQTpk2kSsO/0o/kSzGXefRz1cV+K3DDAeXhzNc3\nkl/SCSmpFPM+m2IowmsST7dd4+D59UJqq1mUmjyLaK4MtGl7aavkAjXzAHFyyE0z\nXGSfhlIY06DmqE4f22u6jWLKEQKBgQC7m4OMYZSX/9WZrkC+NiJKugfCyuOpdagT\noGGWSYI/7o6UccQqxLjooCoZC1XTgQHPQigLWKmwSJhxrAAui0LzmTmSI73eCqzL\nl1ZQ9J2U5LGqiG9gQYyzJUV+vOYcT+j5zD3NeIT75O2yo8nnUkr6l8AFjAFvBmU1\nqYi6mMaaaQKBgC5y2l8DV9mjpzbc7/n31WISqupc+IEipqevQT16XyqgRFNjVS39\n7w+3aWnsiFi9CtXxHePAGljgnfneqlemo3GbqXtqe43FT9GVtD7mPQIayVMe58RY\n8sW8gSNghfYYRyO6hqRVNPyKQl+shxT7rMgPlv4KqtLDAcwvgwCW3NUxAoGAZKwv\nC0XR1z8SAEXhuDCUdkUdpQn64RSh/OYzd9I6ctQw7red7NVj5HEOJiJPDBBOSEnX\n8z7A0DgkldsWveM9KjsvCZzkZiKUVyv+xbJ+XUfbjwdnvN9wATIe+MOlN8wp2OIg\nyAHEWueeJh5+WgNu+Mo14MQggNONvB4doQQajwECgYEA6BJmKzDHI8yBum99gnnz\n0WttCPFhbJUccxzrBeWHdKhy/9FOJ1m5KSDieNUeuJwxXi/J/nrLcLzsTOwtgxCV\n7nTtlQEPuIqfHLyPiWPM3R9HJOvyyKUoOtJWlBaeCj9uAVRiRB4Ga6hNtCgFP4np\nJ45ZE94QH7ASuDEssa5PijY=\n-----END PRIVATE KEY-----\n`,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth: client });
  }

  async clear(spreadsheetId: string): Promise<void> {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `Sheet1!A2:R`,
    });
  }

  async append(
    spreadsheetId: string,
    range: string,
    values: any[][],
  ): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
  }

  async update(
    spreadsheetId: string,
    range: string,
    values: any[][],
  ): Promise<void> {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
  }

  async update_report_google_sheet() {
    const spreadsheetId = "169D79qo-4pMiHb56ZpuDe2GUe7vyC_Vz7lRv4XD73iA";
    const tekmetric_values = await this.prepare_tek_connedted_shop();
    const protractor_values = await this.prepare_pro_connected_shop();
    const values = tekmetric_values.concat(protractor_values);
    const finalRowIndex = 2 + values.length;
    const range = `Sheet1!A2:T${finalRowIndex}`;

    await this.clear(spreadsheetId);
    await this.update(spreadsheetId, range, values);
    // const rangeBefore = `Sheet1!A2:C${finalRowIndex}`
    // const rangeAfter = `Sheet1!F2:S${finalRowIndex}`
    // const valuesBefore = values.map(item => item.slice(0,3))
    // const valuesAfter = values.map(item => item.slice(5))

    // await this.update(spreadsheetId, rangeBefore, valuesBefore)
    // await this.update(spreadsheetId, rangeAfter, valuesAfter)

    // const values = await this.prepare_pro_connected_shop();
    // const finalRowIndex = 66 + values.length
    // const rangeBefore = `Sheet1!A66:C${finalRowIndex}`
    // const rangeAfter = `Sheet1!F66:S${finalRowIndex}`
    // const valuesBefore = values.map(item => item.slice(0,3))
    // const valuesAfter = values.map(item => item.slice(5))

    // await this.update(spreadsheetId, rangeBefore, valuesBefore)
    // await this.update(spreadsheetId, rangeAfter, valuesAfter)
  }

  async prepare_tek_connedted_shop() {
    const ShopsData = await this.tekmetricApiService.fetch<TekmetricShop[]>(
      "/shops",
    );
    const OwnerData = await Promise.all(
      ShopsData.map((item) => this.tekmetricService.getOwners(item.id)),
    );
    const Customers = await Promise.all(
      ShopsData.map((item) => this.tekmetricService.getCustomerCount(item.id)),
    );
    const LastVisists04 = await Promise.all(
      ShopsData.map((item) =>
        this.tekmetricService.getJobsWithAuthorizedDateCount(item.id, 4, 0),
      ),
    );
    const LastVisists01 = await Promise.all(
      ShopsData.map((item) =>
        this.tekmetricService.getJobsWithAuthorizedDateCount(item.id, 1, 0),
      ),
    );
    const LastVisists12 = await Promise.all(
      ShopsData.map((item) =>
        this.tekmetricService.getJobsWithAuthorizedDateCount(item.id, 2, 1),
      ),
    );
    const LastVisists23 = await Promise.all(
      ShopsData.map((item) =>
        this.tekmetricService.getJobsWithAuthorizedDateCount(item.id, 3, 2),
      ),
    );
    const LastVisists34 = await Promise.all(
      ShopsData.map((item) =>
        this.tekmetricService.getJobsWithAuthorizedDateCount(item.id, 4, 3),
      ),
    );
    const FirstVisit = await Promise.all(
      ShopsData.map((item) => this.tekmetricService.getFirstVisitDate(item.id)),
    );
    const MigrationDate = await Promise.all(
      ShopsData.map((item) => this.tekmetricService.getMigraionDate(item.id)),
    );
    const SortedShopsData = ShopsData.sort((a, b) => a.id - b.id);
    const SortedOwnerData = OwnerData.sort((a, b) => a.shopid - b.shopid);
    const SortedCustomersData = Customers.sort((a, b) => a.shopid - b.shopid);
    const DataForSheet = SortedShopsData.map((item, index) => [
      item.name,
      "Tekmetric",
      item.id,
      "Connected",
      new Date().toISOString().split("T")[0],
      "",
      "",
      item.website,
      item.phone,
      SortedOwnerData[index].firstname,
      SortedOwnerData[index].lastname,
      SortedOwnerData[index].email,
      SortedCustomersData[index].customercount,
      LastVisists04[index].jobswithauthorizeddatecount,
      LastVisists01[index].jobswithauthorizeddatecount,
      LastVisists12[index].jobswithauthorizeddatecount,
      LastVisists23[index].jobswithauthorizeddatecount,
      LastVisists34[index].jobswithauthorizeddatecount,
      FirstVisit[index].firstvisitdate,
      MigrationDate[index].migrationdate,
    ]);

    return DataForSheet;
  }

  async prepare_pro_connected_shop() {
    const ShopList = [
      "Sours VA",
      "AG Automotive - OR",
      "Highline – AZ",
      "Toledo Autocare - B&L Whitehouse - OH",
      "Toledo Autocare - Monroe Street - OH",
      "Toledo Autocare - HEATHERDOWNS - OH",
      "Wayside Garage – CA",
    ];

    const ShopsDate = await Promise.all(
      ShopList.map((item) => this.protractorService.getCustomers(item)),
    );
    const LastVisists04 = await Promise.all(
      ShopList.map((item) => this.protractorService.getLastVisits(item, 4, 0)),
    );
    const LastVisists01 = await Promise.all(
      ShopList.map((item) => this.protractorService.getLastVisits(item, 1, 0)),
    );
    const LastVisists12 = await Promise.all(
      ShopList.map((item) => this.protractorService.getLastVisits(item, 2, 1)),
    );
    const LastVisists23 = await Promise.all(
      ShopList.map((item) => this.protractorService.getLastVisits(item, 3, 2)),
    );
    const LastVisists34 = await Promise.all(
      ShopList.map((item) => this.protractorService.getLastVisits(item, 4, 3)),
    );
    const DataForSheet = ShopList.map((item, index) => [
      item,
      "Protractor",
      "",
      "Connected",
      new Date().toISOString().split("T")[0],
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ShopsDate[index].customers,
      LastVisists04[index].lastvisits,
      LastVisists01[index].lastvisits,
      LastVisists12[index].lastvisits,
      LastVisists23[index].lastvisits,
      LastVisists34[index].lastvisits,
      "",
      "",
    ]);

    return DataForSheet;
  }

  // async get_status_shopname(){
  //     const spreadsheetId = '1CthMJiT7ofZel4VANFlgujAlydDc8oAcpdCQ4aUO0qA';
  //     const shopNameRange = [`Sheet1!A:A`, `Sheet1!B:B`];
  //     const shopName = await this.sheets.spreadsheets.values.batchGet({
  //         spreadsheetId: spreadsheetId,
  //         ranges: shopNameRange
  //     })
  //     const ShopNames = shopName.data.valueRanges&&shopName.data.valueRanges[0].values?.flat().slice(1)
  //     const ShopStatus = shopName.data.valueRanges&&shopName.data.valueRanges[1].values?.flat().slice(1)
  //     return {
  //         "name": ShopNames,
  //         "status": ShopStatus
  //     }
  // }
}
