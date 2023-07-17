import { Inject, Injectable, Logger } from "@nestjs/common";
import { ProtractorService } from "./protractor.service";
import { Pool } from "pg";
const csvWriter = require("csv-writer");
import path from "path";

type CustomerObject = {
  id: string;
  firstName: string;
  lastName: string;
  newFirstName: string;
  newLastName: string;
  nameCode: string;
  b_year: string | null;
  b_month: string | null;
  b_day: string | null;
  phone1: string | null;
  phone2: string | null;
  email: string | null;
  street: string;
  city: string | null;
  state: string | null;
  postalcode: string | null;
  country: string | null;
  lastVisitStr: string;
  lastvisit: Date;
  shopname: string | null;
  chainid: number | null;
  software: string;
};

@Injectable()
export class ProtractorDeduplicateServiceItemService {
  constructor(
    @Inject("DB_CONNECTION") private readonly db: Pool,
    private readonly protractorService: ProtractorService,
  ) {}

  async fetchRawCustomerData(shop_name: string, chain_id: number | null) {
    const res = await this.protractorService.getProtractorReport(shop_name);
    const rawCustomers = res.map((customer): CustomerObject => {
      return {
        id: customer.id,
        firstName: customer.firstname ? customer.firstname : "",
        lastName: customer.lastname ? customer.lastname : "",
        newFirstName: "",
        newLastName: "",
        nameCode: "",
        b_year: customer.b_year,
        b_month: customer.b_month,
        b_day: customer.b_day,
        phone1: customer.phone1 ? customer.phone1 : "",
        phone2: customer.phone2 ? customer.phone2 : "",
        email: customer.email ? customer.email : "",
        street: customer.addressstreet ? customer.addressstreet : "",
        city: customer.addresscity ? customer.addresscity : "",
        state: customer.addressprovince ? customer.addressprovince : "",
        postalcode: customer.addresspostalcode
          ? customer.addresspostalcode
          : "",
        country: customer.addresscountry ? customer.addresscountry : "",
        lastVisitStr: "",
        lastvisit: customer.lastvisitdate,
        shopname: shop_name,
        chainid: chain_id == 0 ? null : chain_id,
        software: "PRO",
      };
    });

    return rawCustomers;
  }

  async list_cleanup(shop_name: string, chain_id: number | null) {
    const rawCustomers = await this.fetchRawCustomerData(shop_name, chain_id);
    const newCustomerData = rawCustomers.map((customer) => {
      let newNameCode = {
        firstname: "",
        lastname: "",
        resultname: "",
      };
      let newCustomer = { ...customer };

      const keywords = [
        "Associates",
        "Auto Body",
        "Autobody",
        "Center",
        "Company",
        "Corp",
        "Dept",
        "Enterprise",
        "Inc.",
        "Insurance",
        "Landscap",
        "LLC",
        "Motor",
        "Office",
        "Rental",
        "Repair",
        "Salvage",
        "Service",
        "Supply",
        "Tire",
        "Towing",
      ];
      if (/[-&,*^\/]|(\()|( and )|( OR )/i.test(newCustomer.firstName)) {
        newCustomer.firstName = newCustomer.firstName
          .split(/[-&,*^\/]|(\()|( and )|( OR )/i)[0]
          .trim();
        newNameCode.firstname = "New Name";
        if (
          /'\s|[@]/.test(newCustomer.firstName) ||
          newCustomer.firstName.trim().split(/\s/).length > 2
        ) {
          newCustomer.firstName = "";
          newNameCode.firstname = "Bad Name";
        } else if (
          newCustomer.firstName.trim().length === 1 ||
          newCustomer.firstName.trim().length === 0
        ) {
          newCustomer.firstName = "";
          newNameCode.firstname = "Bad Name";
        } else if (
          /\d/.test(newCustomer.firstName) ||
          newCustomer.firstName.includes("'S ") ||
          newCustomer.firstName.includes("'s ")
        ) {
          newCustomer.firstName = "";
          newNameCode.firstname = "Bad Name";
        } else if (
          keywords.some((keyword) => newCustomer.firstName.includes(keyword))
        ) {
          newCustomer.firstName = "";
          newNameCode.firstname = "Bad Name";
        } else if (
          /\bAuto\b/.test(newCustomer.firstName) ||
          /\bCar\b/.test(newCustomer.firstName) ||
          /\bInc\b/.test(newCustomer.firstName) ||
          /\bTown\b/.test(newCustomer.firstName)
        ) {
          newCustomer.firstName = "";
          newNameCode.firstname = "Bad Name";
        } else if (
          newCustomer.firstName.trim().length > 12 &&
          newCustomer.firstName.includes(" ")
        ) {
          newCustomer.firstName = "";
          newNameCode.firstname = "Bad Name";
        }
      } else if (
        /'\s|[@]/.test(newCustomer.firstName) ||
        newCustomer.firstName.trim().split(/\s/).length > 2
      ) {
        newCustomer.firstName = "";
        newNameCode.firstname = "Bad Name";
      } else if (
        newCustomer.firstName.trim().length === 1 ||
        newCustomer.firstName.trim().length === 0
      ) {
        newCustomer.firstName = "";
        newNameCode.firstname = "Bad Name";
      } else if (
        /\d/.test(newCustomer.firstName) ||
        newCustomer.firstName.includes("'S ") ||
        newCustomer.firstName.includes("'s ")
      ) {
        newCustomer.firstName = "";
        newNameCode.firstname = "Bad Name";
      } else if (
        keywords.some((keyword) => newCustomer.firstName.includes(keyword))
      ) {
        newCustomer.firstName = "";
        newNameCode.firstname = "Bad Name";
      } else if (
        /\bAuto\b/.test(newCustomer.firstName) ||
        /\bCar\b/.test(newCustomer.firstName) ||
        /\bInc\b/.test(newCustomer.firstName) ||
        /\bTown\b/.test(newCustomer.firstName)
      ) {
        newCustomer.firstName = "";
        newNameCode.firstname = "Bad Name";
      } else if (
        newCustomer.firstName.trim().length > 12 &&
        newCustomer.firstName.includes(" ")
      ) {
        newCustomer.firstName = "";
        newNameCode.firstname = "Bad Name";
      } else {
        newNameCode.firstname = "";
      }

      if (/[-,*^\/]/.test(newCustomer.lastName)) {
        let splitName = newCustomer.lastName.split(/[-,*^\/]/);
        // console.log(splitName)
        if (splitName[1].length === 0) {
          newCustomer.lastName = splitName[0].trim();
          if (newCustomer.lastName.includes(" OR ")) {
            newCustomer.lastName = newCustomer.lastName.split(" OR ")[1];
          }
        } else {
          newCustomer.lastName = splitName[1].trim();
          if (newCustomer.lastName.includes(" OR ")) {
            newCustomer.lastName = newCustomer.lastName.split(" OR ")[1];
          }
        }
        newNameCode.lastname = "New Name";
        if (
          /[@]|[&]|(\))/.test(newCustomer.lastName) ||
          newCustomer.lastName.trim().length === 1
        ) {
          newCustomer.lastName = "";
          newNameCode.lastname = "Bad Name";
        } else if (
          /\d/.test(newCustomer.lastName) ||
          newCustomer.lastName.includes("'S ") ||
          newCustomer.lastName.includes("'s ") ||
          newCustomer.lastName.split(".").length > 2
        ) {
          newCustomer.lastName = "";
          newNameCode.lastname = "Bad Name";
        } else if (
          newCustomer.lastName.trim().length > 14 &&
          newCustomer.lastName.includes(" ")
        ) {
          newCustomer.lastName = "";
          newNameCode.lastname = "Bad Name";
        }
      } else if (
        /[@]|[&]|(\))/.test(newCustomer.lastName) ||
        newCustomer.lastName.trim().length === 1 ||
        newCustomer.lastName.trim().length === 0
      ) {
        newCustomer.lastName = "";
        newNameCode.lastname = "Bad Name";
      } else if (
        /\d/.test(newCustomer.lastName) ||
        newCustomer.lastName.includes("'S ") ||
        newCustomer.lastName.includes("'s ") ||
        newCustomer.lastName.split(".").length > 2
      ) {
        newCustomer.lastName = "";
        newNameCode.lastname = "Bad Name";
      } else if (
        newCustomer.lastName.trim().length > 14 &&
        newCustomer.lastName.includes(" ")
      ) {
        newCustomer.lastName = "";
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
    });

    const cleanedCustomer = newCustomerData.map((item) => {
      return {
        id: item.oldName.id,
        old_firstname: item.oldName.firstName,
        old_lastname: item.oldName.lastName,
        new_firstname: item.newName.firstName,
        new_lastname: item.newName.lastName,
        namecode: item.nameStatus.resultname,
        b_year: item.oldName.b_year,
        b_month: item.oldName.b_month,
        b_day: item.oldName.b_day,
        address1: item.oldName.street,
        address2: "",
        city: item.oldName.city,
        province: item.oldName.state,
        postalcode: item.oldName.postalcode,
        shop_name: item.oldName.shopname,
        str_date: item.oldName.lastvisit.toISOString().split("T")[0],
        visited_date: item.oldName.lastvisit,
        chain_id: item.oldName.chainid,
        software: "Pr",
      };
    });

    return cleanedCustomer;
  }

  // async addDupFlag(shop_name: string) {
  //   const noAddDupFlagData = await this.list_cleanup(shop_name);
  //   const counts = new Map<string, number>();
  //   const mailables = new Map<string, Date>();
  //   const sortedCustomers = [...noAddDupFlagData].sort(
  //       (a, b) => b.visited_date.getTime() - a.visited_date.getTime()
  //   );
  //   sortedCustomers.forEach((customer) => {
  //       const {old_firstname, old_lastname, address, visited_date} = customer;
  //       const key = `${old_firstname}-${old_lastname}-${address}`;
  //       counts.set(key, (counts.get(key) || 0) + 1);
  //       if (!mailables.has(key)) {
  //           mailables.set(key, visited_date);
  //       }
  //   });

  //   return noAddDupFlagData.map((customer) => {
  //       const {old_firstname, old_lastname, address, visited_date} = customer;
  //       const key = `${old_firstname}-${old_lastname}-${address}`;
  //       const isDuplicate = (counts.get(key) || 0) > 0 && mailables.get(key) !== visited_date ? "Duplicate" : "";
  //       return {...customer, isDuplicate};
  //   });
  // }

  // async addBadAddressFlag(shop_name: string) {
  //   const noBadAddressFlagData = await this.addDupFlag(shop_name);

  //   return noBadAddressFlagData.map((customer) => {
  //       const badAddressFlag = customer.address.trim().length == 0 ? "Bad Address" : "";
  //       return {...customer, badAddressFlag};
  //   })
  // }

  // async generateCleanupReportCSV(shop_name: string) {
  //   const customers = await this.addBadAddressFlag(shop_name);
  //   const writer = csvWriter.createObjectCsvWriter({
  //       path:  path.resolve(__dirname, `./csvFiles/ProCleanupReport-${shop_name}.csv`),
  //       header: [
  //           { id: "old_firstname", title: "First Name" },
  //           { id: "old_lastname", title: "Last Name" },
  //           { id: "new_firstname", title: "New First Name" },
  //           { id: "new_lastname", title: "New Last Name" },
  //           { id: "namecode", title: "NameCode" },
  //           { id: "isDuplicate", title: "Duplicate Flag" },
  //           { id: "id", title: "Customer ID"},
  //           { id: "str_date", title: "LastVisited Date" },
  //           { id: "address", title: "Address" },
  //           { id: "address2", title: "Address2"},
  //           { id: "badAddressFlag", title: "BadAddress Flag"},
  //           { id: "city", title: "City" },
  //           { id: "province", title: "State" },
  //           { id: "postalcode", title: "Zip" },
  //           { id: "shop_name", title: "Shop Name" },
  //           { id: "shop_phone", title: "Shop Phone" },
  //           { id: "shop_email", title: "Shop Email" },
  //           { id: "software", title: "Software"},
  //       ]
  //   })

  //   await writer.writeRecords(customers).then(() => {
  //       console.log('Done!');
  //   })
  // }
}
