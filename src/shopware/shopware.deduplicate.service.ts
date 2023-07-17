import { Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import { Pool } from "pg";
import { ShopwareService } from "./shopware.service";
import { ShopwareShopService } from "./shopware.shop.service";
const csvWriter = require("csv-writer");
import path from "path";

type CustomerObject =  {
    id: number;
    firstname: string;
    lastname: string;
    b_year: string;
    b_month: string;
    b_day: string;
    phone: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    shopname: string;
    shopphone: string;
    shopemail: string;
    shopid: number | null;
    originshopid: number | null;
    tenant: number;
    maxupdated_date: Date;
    chain_id: number | null,
    software: string;
}

@Injectable()
export class ShopWareDeduplicate {
  private readonly logger = new Logger(ShopWareDeduplicate.name);
  constructor(
    private readonly shopwareService : ShopwareService,
    private readonly shopwareShopService: ShopwareShopService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async listLeanUp(tenant_id: number, chainid: number | null, shop_id: number) {
    const rawCustomerData = await this.shopwareService.getSWReport(tenant_id, shop_id)
    const nonNullCustomerData = rawCustomerData.map((customer) => {
        let nonNullCustomer = {
            id: 1,
            firstname: "",
            lastname: "",
            b_year: "",
            b_month: "",
            b_day: "",
            phone: "",
            address: "",
            address2: "",
            city: "",
            state: "",
            zip: "",
            shopname: "",
            shopphone: "",
            shopemail: "",
            shopid: null,
            originshopid: null,
            tenant: 0,
            maxupdated_date: new Date(),
            chain_id: chainid === 0 ? null : chainid,
            software: "SWA",
        }

        customer.first_name != null ? (nonNullCustomer.firstname = customer.first_name.replace(/\s+/g, " ").trim()) : "";
        customer.last_name != null ? (nonNullCustomer.lastname = customer.last_name.replace(/\s+/g, " ").trim()) : "";
        customer.address != null ? (nonNullCustomer.address = customer.address.replace(/\s+/g, " ").trim()) : "";
        customer.city != null ? (nonNullCustomer.city = customer.city.replace(/\s+/g, " ").trim()) : "";
        customer.state != null ? (nonNullCustomer.state = customer.state.replace(/\s+/g, " ").trim()) : "";
        customer.zip != null ? (nonNullCustomer.zip = customer.zip.replace(/\s+/g, " ").trim()) : "";
        nonNullCustomer.id = customer.id,
        customer.b_year != null ? nonNullCustomer.b_year = customer.b_year: "",
        customer.b_month != null ? nonNullCustomer.b_month = customer.b_month: "",
        customer.b_day != null ? nonNullCustomer.b_day = customer.b_day: "",
        nonNullCustomer.shopname = customer.name,
        nonNullCustomer.shopphone = customer.phone,
        nonNullCustomer.shopemail = customer.email,
        nonNullCustomer.shopid = customer.shopid;
        nonNullCustomer.originshopid = customer.originshopid;
        nonNullCustomer.tenant = customer.tenant;
        nonNullCustomer.maxupdated_date = customer.maxupdated_date;
        chainid != 0 ? (nonNullCustomer.chain_id = chainid) : null;

        return nonNullCustomer;

    })

    const newCustomerData = nonNullCustomerData.map((customer) => {
        let newNameCode = {
            firstname: "",
            lastname: "",
            resultname: "",
        }
        let newCustomer: CustomerObject = {...customer};
        const keywords = ["Associates", "Auto Body", "Autobody", "Center", "Company", "Corp","Dept", "Enterprise", "Inc.", "Insurance", "Landscap", "LLC", "Motor", "Office", "Rental", "Repair", "Salvage", "Service", "Supply", "Tire", "Towing"]

        if (/[-&,*^\/]|(\()|( and )|( OR )/i.test(newCustomer.firstname)) {
          console.log(`firstname ${newCustomer.firstname}`)
            newCustomer.firstname = newCustomer.firstname.split(/[-&,*^\/]|(\()|( and )|( OR )/i)[0].trim();
            console.log(`firstname ${newCustomer.firstname}`)
            newNameCode.firstname = "New Name";
            if (/'\s|[@]/.test(newCustomer.firstname) || newCustomer.firstname.trim().split(/\s/).length > 2) {
              newCustomer.firstname = "";
              newNameCode.firstname = "Bad Name";
            } else if (newCustomer.firstname.trim().length === 1 || newCustomer.firstname.trim().length === 0) {
              newCustomer.firstname = "";
              newNameCode.firstname = "Bad Name";
            }  else if (/\d/.test(newCustomer.firstname) || newCustomer.firstname.includes("'S ") ||  newCustomer.firstname.includes("'s ")) {
              newCustomer.firstname = "";
              newNameCode.firstname = "Bad Name";
            } else if (keywords.some(keyword => newCustomer.firstname.includes(keyword))) {
              newCustomer.firstname = "";
              newNameCode.firstname = "Bad Name";
            } else if (/\bAuto\b/.test(newCustomer.firstname) || /\bCar\b/.test(newCustomer.firstname) || /\bInc\b/.test(newCustomer.firstname) || /\bTown\b/.test(newCustomer.firstname)) {
              newCustomer.firstname = "";
              newNameCode.firstname = "Bad Name";
            }
            else if (newCustomer.firstname.trim().length > 12 && newCustomer.firstname.includes(' ')) {
              newCustomer.firstname = "";
              newNameCode.firstname = "Bad Name";
            }
          } else if (/'\s|[@]/.test(newCustomer.firstname) || newCustomer.firstname.trim().split(/\s/).length > 2) {
            newCustomer.firstname = "";
            newNameCode.firstname = "Bad Name";
          }  else if (newCustomer.firstname.trim().length === 1 || newCustomer.firstname.trim().length === 0) {
            newCustomer.firstname = "";
            newNameCode.firstname = "Bad Name";
          } else if (/\d/.test(newCustomer.firstname) || newCustomer.firstname.includes("'S ") ||  newCustomer.firstname.includes("'s ")) {
            newCustomer.firstname = "";
            newNameCode.firstname = "Bad Name";
          } else if (keywords.some(keyword => newCustomer.firstname.includes(keyword))) {
            newCustomer.firstname = "";
            newNameCode.firstname = "Bad Name"
          } else if (/\bAuto\b/.test(newCustomer.firstname) || /\bCar\b/.test(newCustomer.firstname) || /\bInc\b/.test(newCustomer.firstname) || /\bTown\b/.test(newCustomer.firstname)) {
            newCustomer.firstname = "";
            newNameCode.firstname = "Bad Name";
          } else if (newCustomer.firstname.trim().length > 12 && newCustomer.firstname.includes(' ')) {
            newCustomer.firstname = "";
            newNameCode.firstname = "Bad Name";
          } else {
            newNameCode.firstname = "";
          }

          if (/[-,*^\/]/.test(newCustomer.lastname)) {
            let splitName = newCustomer.lastname.split(/[-,*^\/]/);
            if (splitName[1].length === 0) {
                newCustomer.lastname = splitName[0].trim();
                if (newCustomer.lastname.includes(' OR ')){
                  newCustomer.lastname = newCustomer.lastname.split(' OR ')[1]
                }
            } else {
              newCustomer.lastname = splitName[1].trim();
              if (newCustomer.lastname.includes(' OR ')){
                newCustomer.lastname = newCustomer.lastname.split(' OR ')[1]
              }
            }
            // console.log(`lastname:  ${newCustomer.lastname}`)
            newNameCode.lastname = "New Name";
            if (/'\s|[@]|[&]|(\))/.test(newCustomer.lastname) || newCustomer.lastname.trim().length === 1) {
              newCustomer.lastname = "";
              newNameCode.lastname = "Bad Name";
            } else if (/\d/.test(newCustomer.lastname) || newCustomer.lastname.includes("'S ") ||  newCustomer.lastname.includes("'s ") || newCustomer.lastname.split(".").length > 2) {
              newCustomer.lastname = "";
              newNameCode.lastname = "Bad Name";
            } else if(newCustomer.lastname.trim().length > 14 && newCustomer.lastname.includes(' ')) {
              newCustomer.lastname = "";
              newNameCode.lastname = "Bad Name";
            }
          } else if (/'\s|[@]|[&]|(\))/.test(newCustomer.lastname) ||newCustomer.lastname.trim().length === 1 || newCustomer.lastname.trim().length === 0) {
            newCustomer.lastname = "";
            newNameCode.lastname = "Bad Name";
          } else if (/\d/.test(newCustomer.lastname) || newCustomer.lastname.includes("'S ") ||  newCustomer.lastname.includes("'s ") || newCustomer.lastname.split(".").length > 2) {
            newCustomer.lastname = "";
            newNameCode.lastname = "Bad Name";
          } else if(newCustomer.lastname.trim().length > 14 && newCustomer.lastname.includes(' ')) {
            newCustomer.lastname = "";
            newNameCode.lastname = "Bad Name";
          } else {
            newNameCode.lastname = "";
          }
  
          if (
            newNameCode.firstname == "Bad Name" ||
            newNameCode.lastname == "Bad Name"
          ) {
            newNameCode.resultname = "Bad Name";
          } else if (
            newNameCode.firstname == "New Name" ||
            newNameCode.lastname == "New Name"
          ) {
            newNameCode.resultname = "New Name";
          } else {
            newNameCode.resultname = "";
          }

          return {
            oldName: customer,
            newName: newCustomer,
            nameStatus: newNameCode,
          };
        }
    );

    const cleanedCustomer = newCustomerData.map(item => {
         return {
            id:item.oldName.id,
            old_firstname: item.oldName.firstname.trim(),
            old_lastname: item.oldName.lastname.trim(),
            new_firstname: item.newName.firstname.trim(),
            new_lastname: item.newName.lastname.trim(),
            namecode: item.nameStatus.resultname,
            b_year: item.oldName.b_year,
            b_month: item.oldName.b_month,
            b_day: item.oldName.b_day,
            address: item.oldName.address,
            address2: "",
            city: item.oldName.city,
            state: item.oldName.state,
            shop_name: item.oldName.shopname,
            shop_phone: item.oldName.shopphone,
            shop_email: item.oldName.shopemail,
            zip: item.oldName.zip,
            shopid: item.oldName.shopid,
            originshopid: item.oldName.originshopid,
            tenant: item.oldName.tenant,
            chain_id: item.oldName.chain_id,
            str_date:item.oldName.maxupdated_date.toISOString().split("T")[0],
            updated_date: item.oldName.maxupdated_date,
            software: "SW"
        }
    })

    return cleanedCustomer;
  }

//   async addDupFlag(tenant_id: number) {
//     const noAddDupFlagData = await this.listLeanUp(tenant_id);
//     const counts = new Map<string, number>();
//     const mailables = new Map<string, Date>();
//     const sortedCustomers = [...noAddDupFlagData].sort(
//         (a, b) => b.updated_date.getTime() - a.updated_date.getTime()
//     );
//     sortedCustomers.forEach((customer) => {
//         const {old_firstname, old_lastname, address, updated_date, shopid} = customer;
//         const key = `${old_firstname}-${old_lastname}-${address}-${shopid}`;
//         counts.set(key, (counts.get(key) || 0) + 1);
//         if (!mailables.has(key)) {
//             mailables.set(key, updated_date);
//         }
//     });

//     return noAddDupFlagData.map((customer) => {
//         const {old_firstname, old_lastname, address, updated_date, shopid} = customer;
//         const key = `${old_firstname}-${old_lastname}-${address}-${shopid}`;
//         const isDuplicate = (counts.get(key) || 0) > 0 && mailables.get(key) !== updated_date ? "Duplicate" : "";
//         return {...customer, isDuplicate};
//     });
//   }

//   async addBadAddressFlag(tenant_id: number) {
//     const noBadAddressFlagData = await this.addDupFlag(tenant_id);

//     return noBadAddressFlagData.map((customer) => {
//         const badAddressFlag = customer.address.trim().length == 0 ? "Bad Address" : "";
//         return {...customer, badAddressFlag};
//     })
//   }

//   async generateCleanupReportCSV(tanent_id: number) {
//     const customers = await this.addBadAddressFlag(tanent_id)
//     const writer = csvWriter.createObjectCsvWriter({
//       path: path.resolve(__dirname, `./csvFiles/SWCleanupReport(${tanent_id}).csv`),
//       header: [
//         { id: "old_firstname", title: "First Name" },
//         { id: "old_lastname", title: "Last Name" },
//         { id: "new_firstname", title: "New First Name" },
//         { id: "new_lastname", title: "New Last Name" },
//         { id: "namecode", title: "NameCode" },
//         { id: "isDuplicate", title: "Duplicate Flag" },
//         { id: "id", title: "Customer ID"},
//         { id: "str_date", title: "Authorized Date" },
//         { id: "address", title: "Address" },
//         { id: "address2", title: "Address2"},
//         { id: "badAddressFlag", title: "BadAddress Flag"},
//         { id: "city", title: "City" },
//         { id: "state", title: "State" },
//         { id: "zip", title: "Zip" },
//         { id: "shop_name", title: "Shop Name" },
//         { id: "shop_phone", title: "Shop Phone" },
//         { id: "shop_email", title: "Shop Email" },
//         { id: "shopid", title: "Shop Id" },
//         { id: "software", title: "Software"},
//       ]
//     });

//     await writer.writeRecords(customers).then(() => {
//       console.log('Done!');
//     })
//   }
}
