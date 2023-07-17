import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Pool } from 'pg';
import { TekmetricService } from '../tekmetric/tekmetric.service';
import { TekmetricDeduplicate } from '../tekmetric/tekmetric.deduplicate.service';
import { ShopWareDeduplicate } from '../shopware/shopware.deduplicate.service';
import { ProtractorDeduplicateServiceItemService } from '../protractor/protractor.deduplicate.service';
const csvWriter = require("csv-writer");
import path from "path";

type ProChainGroup = {
    wow_shop_id: number;
    shopname: string;
    fixed_shopname: string;
    shop_id: string | null;
    chain_id: number | null;
    software: string;
}

type TekChainGroup = {
    wow_shop_id: number;
    shopname: string;
    shop_id: number;
    chain_id: number | null;
    software: string;
}

type SWChainGroup = {
    wow_shop_id: number;
    shopname: string;
    shop_id: number;
    tenant_id: number;
    chain_id: number | null;
    software: string;
}

type ChainObejct = {
    tek: TekChainGroup [];
    sw: SWChainGroup [];
    pro: ProChainGroup [];
}

type CustomerObejct = {
    id: number | string
}

type ReportObejct = {
    old_firstname: string;
    old_secondname: string;
    new_firstname: string;
    new_secondname: string;
    name_code: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    shop_id: number | null;
    chain_id: number | null;
    authorized_date: Date;
    str_date: string;
    software: string;
}

const ProShops = [
    {
        "id": "1614ec5b5c234361976ae718729a9119",
        "name": "AG Automotive - OR"
    },
    {
        "id": "6962e4ee2c0a4d189f4c521270c80a7b",
        "name": "Highline – AZ"
    },
    {
        "id": "2bb37cdd6a1f40e893f27ee1cc7edb0a",
        "name": "Toledo Autocare - B&L Whitehouse 3RD location"
    },
    {
        "id": "3d5591b2efc94b73b7daac6525004764",
        "name": "Toledo Autocare - Monroe Street 1ST location"
    },
    {
        "id": "aad3590f79ac44aca4f16dc7cb1afedb",
        "name": "Toledo Autocare - HEATHERDOWNS 2ND location"
    },
    {
        "id": "2d8ccab7667f4a8bb56815c4efc9bb97",
        "name": "Wayside Garage – CA"
    },
    {
        "id": "3ed20563cfe8473f98c9ffa72870d327",
        "name": "Sours  VA"
    }
]


@Injectable()
export class ListcleanupService {
    private readonly logger = new Logger(ListcleanupService.name);
    constructor(
        private readonly tekmetricDedupeService: TekmetricDeduplicate,
        private readonly shopwareDedupeService: ShopWareDeduplicate,
        private readonly protractorDedupeService: ProtractorDeduplicateServiceItemService,
        @Inject("DB_CONNECTION") private readonly db: Pool,
    ){}

    async listCleanUpPro(shop_group: ProChainGroup) {
        const res = await this.protractorDedupeService.list_cleanup(shop_group.shopname, shop_group.chain_id)
        
        const proCustomers = res.map((item) => {
            let shop = ProShops.find(shop => shop.name === item.shop_name);
            let shopid = shop ? shop.id : null;

            return {
                wow_shop_id: shop_group.wow_shop_id,
                id: item.id,
                old_firstname: item.old_firstname,
                old_secondname: item.old_lastname,
                new_firstname: item.new_firstname,
                new_secondname: item.new_lastname,
                name_code: item.namecode,
                b_year: item.b_year,
                b_month: item.b_month,
                b_day: item.b_day,
                address1: item.address1,
                address2: item.address2,
                city: item.city,
                state: item.province,
                zip: item.postalcode,
                shop_name: shop_group.fixed_shopname,
                shop_id: shopid,
                chain_id: item.chain_id,
                authorizied_date: item.visited_date,
                str_date: item.str_date,
                software: 'PRO'
            }
        })

        return proCustomers;
            
    }

    async listCleanUpSW(shop_group: SWChainGroup) {
        const res = await this.shopwareDedupeService.listLeanUp(shop_group.tenant_id, shop_group.chain_id, shop_group.shop_id)

        const swCustomers = res.map((item) => {
            return {
                wow_shop_id: shop_group.wow_shop_id,
                id: item.id,
                old_firstname: item.old_firstname,
                old_secondname: item.old_lastname,
                new_firstname: item.new_firstname,
                new_secondname: item.new_lastname,
                name_code: item.namecode,
                b_year: item.b_year,
                b_month: item.b_month,
                b_day: item.b_day,
                address1: item.address,
                address2: item.address2,
                city: item.city,
                state: item.state,
                zip: item.zip,
                shop_name: item.shop_name,
                shop_id: shop_group.shop_id,
                chain_id: item.chain_id,
                authorizied_date: item.updated_date,
                str_date: item.str_date,
                software: "SWA"
            }
        })
        return swCustomers;
    }

    async listCleanUpTek(shop_group: TekChainGroup) {
        const res = await this.tekmetricDedupeService.list_cleanup(shop_group.shop_id, shop_group.chain_id);
        
        const tekCustomers = res.map((item) => {
            return {
                wow_shop_id: shop_group.wow_shop_id,
                id: item.id,
                old_firstname: item.old_firstname,
                old_secondname: item.old_lastname,
                new_firstname: item.new_firstname,
                new_secondname: item.new_lastname,
                name_code: item.namecode,
                b_year: item.byear,
                b_month: item.bmonth,
                b_day: item.bday,
                address1: item.address1,
                address2: item.address2,
                city: item.address_city,
                state: item.address_state,
                zip: item.address_zip,
                shop_name: item.shop_name,
                shop_id: item.shop_id,
                chain_id: item.chain_id,
                authorizied_date: item.authorized_date,
                str_date: item.str_date,
                software: "TEK"
            };
        });

        return tekCustomers;
    }

    async mergeCleanUpData(allShops: ChainObejct) {
        const tekCustomers = allShops.tek.length != 0
            ? await Promise.all(allShops.tek.map(item => this.listCleanUpTek(item)))
            : [];
    
        const proCustomers = allShops.pro.length != 0
            ? await Promise.all(allShops.pro.map(item => this.listCleanUpPro(item)))
            : [];
    
        const swCustomers = allShops.sw.length != 0
            ? await Promise.all(allShops.sw.map(item => this.listCleanUpSW(item)))
            : [];
    
        let mergedCustomers = [...tekCustomers.flat(), ...proCustomers.flat(), ...swCustomers.flat()];

        // const uniqueMergedCustomers = Array.from(new Set(mergedCustomers.map(item => item.id)))
        //                 .map(id => mergedCustomers.find(item => item.id === id));
        // const noBadyCustomers = mergedCustomers.filter(item => item.b_year === null || item.b_month === null || item.b_year?.trim() === "" || item.b_month?.trim() === "")
        // const okBadyCustomers = mergedCustomers.filter(item => item.b_year != null && item.b_month != null && item.b_year?.trim() != "" && item.b_month?.trim() != "")

        // return mergedCustomers

        return mergedCustomers
    }

    async addBadAddressFlag (allShops: ChainObejct) {
        const mergedCustomers = await this.mergeCleanUpData(allShops)
        const addedFlagCustomers = mergedCustomers.map((item) => {
            return {
                ...item,
                "isBadAddress": (item.address1.trim() === "" && item.address2.trim() === "")? "Bad Address": "",
                "WCAID": "",
                "MBDayMo": "",
                "OBDayYr": "",
                "OBDayMo": "",
                "OBDayDay":""
            }
        })

        return addedFlagCustomers;
    }

    async addDupFlagBasedCI (allShops: ChainObejct) {
        const addedFlagCustomers = await this.addBadAddressFlag(allShops);
        const counts = new Map<string, number>();
        const mailables = new Map<string, Date>();
        const sortedCutomers = [...addedFlagCustomers].sort(
            (a, b) => b.authorizied_date.getTime() - a.authorizied_date.getTime(),
        );
        sortedCutomers.forEach((customer) => {
            const {new_firstname, new_secondname, address1, address2, authorizied_date, chain_id, wow_shop_id, software} = customer;
            const key = chain_id != null
            ? `${new_firstname}-${new_secondname}-${address1}-${address2}-${chain_id}-${software}`
            : `${new_firstname}-${new_secondname}-${address1}-${address2}-${wow_shop_id}-1-${software}`;

            counts.set(key, (counts.get(key) || 0) + 1);
            if (!mailables.has(key)) {
                mailables.set(key, authorizied_date);
            }
        });
        const completedReport =  addedFlagCustomers.map(customer => {

            const {new_firstname, new_secondname, address1, address2, authorizied_date, wow_shop_id, chain_id, software} = customer;
            const key = chain_id != null
            ? `${new_firstname}-${new_secondname}-${address1}-${address2}-${chain_id}-${software}`
            : `${new_firstname}-${new_secondname}-${address1}-${address2}-${wow_shop_id}-1-${software}`;
            const isDuplicate = (counts.get(key) || 0) > 1 && mailables.get(key) !== authorizied_date
            ? "Duplicate"
            : ""

            return {...customer, isDuplicate}
        })
        // ignore the bad name , bad address and deduplication

        const okBadyCustomers = completedReport.filter(item => item.isBadAddress != "Bad Address" && item.isDuplicate != "Duplicate" && item.name_code != "Bad Name")

        const cleanedreport = okBadyCustomers.sort((a, b) => {
            const dateComparison = a.authorizied_date.getTime() - b.authorizied_date.getTime();

            if (dateComparison !== 0) {
                return dateComparison;
              }

              return Number(a.b_month) - Number(b.b_month);
            }
        )

        let count = -1;

        return cleanedreport.map((item) => {
            if (item.b_month?.trim() === "00" || item.b_month?.trim() === "0"){
                item.b_month = ""
                console.log(item)
            }
            if (item.b_month === "" || item.b_month === null) {
                count += 1;
            }
            return {
                ...item,
                "TBDayMo": (item.b_month === "" || item.b_month === null)? (count % 12 + 1).toString() : "",
            }
        });
    }

    async saveAsCSVFile(allShops: ChainObejct) {
        const customers = await this.addDupFlagBasedCI(allShops);
        const writer = csvWriter.createObjectCsvWriter({
            path: path.resolve(__dirname, "./csvFiles/Accuzip Input.csv"),
            header: [
                { id: "wow_shop_id", title: "WSID" },
                { id: "WCAID", title: "WCID" },
                { id: "chain_id", title: "WCAID" },
                { id: "software", title: "Software" },
                { id: "shop_id", title: "SID" },
                { id: "id", title: "CID" },
                { id : "str_date", title: "AuthDate"},
                { id: "b_year", title: "MBDayYr" },
                { id: "b_month", title: "MBDayMo" },
                { id: "TBDayMo", title: "TBDayMo" },
                { id: "new_firstname", title: "First" },
                { id: "new_secondname", title: "Last" },
                { id: "address1", title: "Address" },
                { id: "address2", title: "Address2"},
                { id: "city", title: "City" },
                { id: "state", title: "St" },
                { id: "zip", title: "Zip"},
            ]
            // header : [
            //         { id: "wow_shop_id", title: "WSID" },
            //         { id: "chain_id", title: "WCID" },
            //         { id: "WCAID", title: "WCAID" },
            //         { id: "software", title: "Software" },
            //         { id: "shop_id", title: "SID" },
            //         { id: "id", title: "CID" },
            //         { id: "MBDayMo", title: "MBDayMo" },
            //         { id: "TBDayMo", title: "TBDayMo" },
            //         { id: "new_firstname", title: "First" },
            //         { id: "new_secondname", title: "Last" },
            //         { id: "address1", title: "Address" },
            //         { id: "address2", title: "Address2"},
            //         { id: "city", title: "City" },
            //         { id: "state", title: "St" },
            //         { id: "zip", title: "Zip"},
            //         { id: "name_code", title: "NameCode" },
            //         { id: "isBadAddress", title: "isBadAddress"},
            //         { id: "isDuplicate", title: "isDuplicate"},
            //         { id: "old_firstname", title: "OFirstName" },
            //         { id: "old_secondname", title: "OLastName" },
            //         { id: "b_year", title: "ABDayYr" },
            //         { id: "b_month", title: "ABDayMo"},
            //         { id: "b_day", title: "ABDayDay"},
            //         { id: "OBDayYr", title: "OBDayYr" },
            //         { id: "OBDayMo", title: "OBDayMo"},
            //         { id: "OBDayDay", title: "OBDayDay"},
            //         { id: "str_date", title: "Authorized Date" },
            //         { id: "shop_name", title: "Shop Name"},
            //     ]
        });

        await writer.writeRecords(customers).then(() => {
            console.log('Done!')
        })
    }
}
