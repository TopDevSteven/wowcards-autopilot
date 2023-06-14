import { Inject, Injectable, Logger ,forwardRef } from "@nestjs/common";
import { Pool } from "pg";
import { TekmetricService } from "./tekmetric.service";
import { TekmetricCustomerService } from "./tekmetric.customer.service";

const activeShopList = [
398,
1159,
1552,
3028,
3586,
3229,
3472,
293,
1216,
4494,
888,
309,
2442,
3543,
3547,
3758,
3540,
3539,
3761,
1873,
3542,
3541,
3759,
331,
1692,
2305,
3520,
1398,
3351,
3385,
4120
]

type  CustomerObject = {
    firstname: string;
    lastname: string;
    address1: string;
    address2: string;
    address_city: string;
    address_state: string;
    address_zip: string;
    lastauthorized_date: Date;
}

type NameCodeObject = {
    firstname: string;
    lastname: string;
    resultname: string;
}

type InputObject = {
    oldName: CustomerObject,
    newName: CustomerObject,
    nameStatus: NameCodeObject
}
    
type OutputObject = {
    old_firstname: string;
    old_lastname: string;
    new_firstname: string;
    new_lastname: string;
    namecode: string;
    address1: string;
    address2: string;
    address_city: string;
    address_state: string;
    address_zip: string;
    authorized_date: Date;
    str_date: string;
    shop_id: number;
}

type ChainObject = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    address1: string;
    address2: string;
    city: string | null;
    state: string;
    zip: string | null;
    fulladdress: string;
    streetaddress: string;
    shopid: number;
}

type ChainOutputObject = {
    old_firstname: string | null
    old_lastname: string | null,
    new_firstname: string | null,
    new_lastname: string | null,
    namecode: string | null,
    address1: string,
    address2: string,
    address_city: string,
    address_state: string,
    address_zip:string,
    owner_firstname: string | null,
    owner_lastname: string | null,
    owner_email: string | null,
    owner_address1: string | null,
    owner_address2: string | null,
    shop_id: number,
    authorized_date: Date,
    str_date: string | null,
    
}

@Injectable()
export class TekmetricDeduplicate {
  private readonly logger = new Logger(TekmetricDeduplicate.name);
  constructor(
    @Inject(forwardRef(() => TekmetricService))
    private readonly tekmetricService: TekmetricService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async fetchRawCustomerDate(shop_id: number){
    const res = await this.db.query(
        `
        SELECT (c.firstname), (c.lastname), (c.address1), (c.address2), c.address_city, c.address_state, c.address_zip, j.lastauthorized_date
        FROM tekcustomer AS c
        JOIN(
          SELECT customerid, MAX(authorizedDate) as lastauthorized_date
          FROM tekjob
          GROUP BY customerid
        ) as j
        ON c.id = j.customerid
        WHERE DATE(j.lastauthorized_date) >= DATE(NOW() - INTERVAL '4 YEARS')
        AND c.shopId = ${shop_id}
        `
      )

    return res.rows
  }

  async list_cleanup(shop_id: number) {
    const rawCustomerData = await this.fetchRawCustomerDate(shop_id)

    const oldCustomerData = rawCustomerData.map((customer): CustomerObject => {
        let oldCustomer = {
            "firstname": "",
            "lastname": "",
            "address1": "",
            "address2": "",
            "address_city": "",
            "address_state": "",
            "address_zip": "",
            "lastauthorized_date" : new Date()
        }
        customer.firstname !=  null ? oldCustomer.firstname = customer.firstname.replace(/\s+/g, ' ').trim() : ""
        customer.lastname !=  null ? oldCustomer.lastname = customer.lastname.replace(/\s+/g, ' ').trim() : ""
        customer.address1 != null ? oldCustomer.address1 = customer.address1.replace(/\s+/g, ' ').trim() : ""
        customer.address2 != null ? oldCustomer.address2 = customer.address2.replace(/\s+/g, ' ').trim() : ""
        customer.address_city != null ? oldCustomer.address_city = customer.address_city.replace(/\s+/g, ' ').trim() : ""
        customer.address_state != null ? oldCustomer.address_state = customer.address_state.replace(/\s+/g, ' ').trim() : ""
        customer.address_zip != null ? oldCustomer.address_zip = customer.address_zip.replace(/\s+/g, ' ').trim(): ""
        oldCustomer.lastauthorized_date = customer.lastauthorized_date

        if (oldCustomer.firstname.includes("  ")){
            oldCustomer.firstname.replace("  ", ' ')
            if(oldCustomer.firstname.includes(" ")){
                console.log(oldCustomer.firstname)
            }
        }
        return oldCustomer;
    })

    const Customers = oldCustomerData.map((oldCustomer: CustomerObject) : {oldName: CustomerObject, newName: CustomerObject, nameStatus: NameCodeObject} => {
        let newNameCode: NameCodeObject = {firstname: "", lastname: "", resultname : ""}
        let newCustomer: CustomerObject = {...oldCustomer};
        if (/[-&\/]|(\()|( and )/i.test(newCustomer.firstname)) {
            newCustomer.firstname = newCustomer.firstname.split(/[-&\/]|(\()|( and )/i)[0].trim()
            newNameCode.firstname = "New Name";
            if (/[@]/.test(newCustomer.lastname) || newCustomer.firstname.trim().split(/\s/).length > 2) {
                newCustomer.firstname = "";
                newNameCode.firstname = "Bad Name";
            } else if (newCustomer.firstname.trim().length === 1 || newCustomer.firstname.trim().length === 0) {
                newCustomer.firstname = "";
                newNameCode.firstname = "Bad Name";
            } else if (newCustomer.firstname.trim().length > 11 && newCustomer.firstname.trim().split(/\s/).length == 2) {
                newCustomer.firstname = "";
                newNameCode.firstname = "Bad Name";
            }
        } else if (/[@]/.test(newCustomer.lastname) || newCustomer.firstname.trim().split(/\s/).length > 2)  {
            newCustomer.firstname = "";
            newNameCode.firstname = "Bad Name";
        } else if (newCustomer.firstname.trim().length > 11 && newCustomer.firstname.trim().split(/\s/).length == 2) {
            newCustomer.firstname = "";
            newNameCode.firstname = "Bad Name";
        } else if (newCustomer.firstname.trim().length === 1 || newCustomer.firstname.trim().length === 0) {
            newCustomer.firstname = "";
            newNameCode.firstname = "Bad Name";
        } else {
            newNameCode.firstname = "";
        }

        if (/[-\/]/.test(newCustomer.lastname)) {
            newCustomer.lastname = newCustomer.lastname.split(/[-\/]/)[1].trim();
            newNameCode.lastname = "New Name";
            if (/[@]|[&]|(\))/.test(newCustomer.lastname) || newCustomer.lastname.trim().length ===1 || newCustomer.lastname.trim().split(/\s/).length > 2) {
                newCustomer.lastname = "";
                newNameCode.lastname = "Bad Name";
            }
        } else if (/[@]|[&]|(\))/.test(newCustomer.lastname) || newCustomer.lastname.trim().length ===1 || newCustomer.lastname.trim().length === 0 || newCustomer.lastname.trim().split(/\s/).length > 2) {
            newCustomer.lastname = "";
            newNameCode.lastname = "Bad Name";
        } else {
            newNameCode.lastname = "";
        }

        if (newNameCode.firstname == "Bad Name" || newNameCode.lastname == "Bad Name"){
            newNameCode.resultname = "Bad Name"
        } else if (newNameCode.firstname == "New Name" || newNameCode.lastname == "New Name") {
            newNameCode.resultname = "New Name"
        } else {
            newNameCode.resultname = ""
        }
        return {
            oldName: oldCustomer,
            newName: newCustomer,
            nameStatus: newNameCode
        };
    });

    return Customers;
  }

  async transformerRawCustomer(shop_id: number) {
    const rawCustomers = await this.list_cleanup(shop_id);
    const newCustomers = rawCustomers.map((item: InputObject): OutputObject => {
        return {
            old_firstname: item.oldName.firstname.trim(),
            old_lastname: item.oldName.lastname.trim(),
            new_firstname: item.newName.firstname.trim(),
            new_lastname: item.newName.lastname.trim(),
            namecode: item.nameStatus.resultname,
            address1: item.oldName.address1,
            address2: item.oldName.address2,
            address_city: item.oldName.address_city,
            address_state: item.oldName.address_state,
            address_zip: item.oldName.address_zip,
            authorized_date: item.oldName.lastauthorized_date,
            str_date: item.oldName.lastauthorized_date.toISOString().split("T")[0],
            shop_id: shop_id
        }
    })

    return newCustomers;
  }

  async addDupFlagBasedSI(shop_id: number) {
    const rawData = await this.transformerRawCustomer(shop_id)
    const counts = new Map<string, number>()
    const mailables = new Map<string, Date>();
    const sortedCustomers = [...rawData].sort((a, b) => b.authorized_date.getTime() - a.authorized_date.getTime());
    sortedCustomers.forEach(customer => {
        const { old_firstname, old_lastname, address1, address2,authorized_date} = customer;
        const key = `${old_firstname}-${old_lastname}-${address1}-${address2}`;
        counts.set(key, (counts.get(key) || 0) + 1);
        if (!mailables.has(key)) {
            mailables.set(key, authorized_date);
          }
    });
    return rawData.map(customer => {
        const { old_firstname, old_lastname, address1, address2, authorized_date } = customer;
        const key = `${old_firstname}-${old_lastname}-${address1}-${address2}`;
        const isDuplicate = (counts.get(key) || 0) > 1 && mailables.get(key) !== authorized_date? "Duplicate" : "";
        return { ...customer, isDuplicate };
      });
  }



  async fetchChainShops(){
    // const shopIds = await this.db.query(`SELECT id FROM tekshop`)
    // const shopOwners = await Promise.all(
    //     shopIds.rows.map(shop_id => this.tekmetricService.getOwners(shop_id.id))
    // )
    // In terms of activae Shop List
    const shopOwners = await Promise.all(
        activeShopList.map(id => this.tekmetricService.getOwners(id))
    )
    let map = new Map<string, ChainObject[]>()
    for (let item of shopOwners.flat()) {
        let key = `${item.firstname}-${item.lastname}-${item.email}`;

        if(map.has(key)) {
            let array = map.get(key);
            array?.push(item);
        } else {
            map.set(key, [item]);
        }
    }
    const groupedOwners: ChainObject[][] = Array.from(map.values());

    return groupedOwners;
  }

  async fetchChainCustomer(){
    const chainOwner = await this.fetchChainShops()
    let chainGroup = new Array<ChainObject[]>()
    for (let item of chainOwner) {
        if (item.length >1) {
            chainGroup.push(item)
        }
    }
    const chainCustomers: ChainOutputObject[][] = await Promise.all(
        chainGroup[0].map(async (owner: ChainObject)  => {
            const rawCustomers = await this.list_cleanup(owner.shopid);
            const newCustomers = rawCustomers.map((item: InputObject) =>{
                return {
                    old_firstname: item.oldName.firstname.trim(),
                    old_lastname: item.oldName.lastname.trim(),
                    new_firstname: item.newName.firstname.trim(),
                    new_lastname: item.newName.lastname.trim(),
                    namecode: item.nameStatus.resultname,
                    address1: item.oldName.address1,
                    address2: item.oldName.address2,
                    address_city: item.oldName.address_city,
                    address_state: item.oldName.address_state,
                    address_zip: item.oldName.address_zip,
                    owner_firstname: owner.firstname,
                    owner_lastname: owner.lastname,
                    owner_email: owner.email,
                    owner_address1: owner.address1,
                    owner_address2: owner.address2,
                    shop_id: owner.shopid,
                    authorized_date: item.oldName.lastauthorized_date,
                    str_date: item.oldName.lastauthorized_date.toISOString().split("T")[0]
                }
            })
            return newCustomers.flat();
        })
    )
    return chainCustomers.flat();
  }

  async addDupFlagBasedCI() {
    const rawData = await this.fetchChainCustomer()
    const counts = new Map<string, number>()
    const mailables = new Map<string, Date>();
    const sortedCustomers = [...rawData].sort((a, b) => b.authorized_date.getTime() - a.authorized_date.getTime());
    sortedCustomers.forEach(customer => {
        const { old_firstname, old_lastname, address1, address2,authorized_date, owner_firstname, owner_lastname, owner_email} = customer;
        const key = `${old_firstname}-${old_lastname}-${address1}-${address2}-${owner_firstname}-${owner_lastname}-${owner_email}`;
        counts.set(key, (counts.get(key) || 0) + 1);
        if (!mailables.has(key)) {
            mailables.set(key, authorized_date);
          }
    });
    return rawData.map(customer => {
        const { old_firstname, old_lastname, address1, address2, authorized_date ,owner_firstname, owner_lastname, owner_email} = customer;
        const key = `${old_firstname}-${old_lastname}-${address1}-${address2}-${owner_firstname}-${owner_lastname}-${owner_email}`;
        const isDuplicate = (counts.get(key) || 0) > 1 && mailables.get(key) !== authorized_date? "Duplicate" : "";
        return { ...customer, isDuplicate };
      });
  }
}
