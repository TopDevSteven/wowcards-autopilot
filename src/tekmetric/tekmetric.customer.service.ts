import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ConfigService } from "@nestjs/config";
import { TekmetricApiService } from "./api.service";

type TekmetricCustomer = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: any[];
  address: {
    id: number | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  notes: string | null;
  customerType: {
    id: number;
    code: string | null;
    name: string | null;
  };
  contactFirstName: string | null;
  contactLastName: string | null;
  shopId: number;
  okForMarketing: boolean | null;
  createdDate: Date | null;
  updatedDate: Date | null;
  deletedDate: Date | null;
  birthday: Date | null;
};

@Injectable()
export class TekmetricCustomerService {
  private readonly logger = new Logger(TekmetricCustomerService.name);
  constructor(
    private configService: ConfigService,
    private readonly apiService: TekmetricApiService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async fetchCustomerEachPagesData(url: string) {
    const res = await this.apiService.fetch<{
      content: TekmetricCustomer[];
    }>(url);
    return res.content;
  }

  async writeCustomersToDB(tekmetriccustomers: TekmetricCustomer[]) {
    const customers = tekmetriccustomers.reduce(
      (result, customer) => ({
        ids: [...result.ids, customer.id],
        firstNames: [...result.firstNames, customer.firstName],
        lastNames: [...result.lastNames, customer.lastName],
        emails: [...result.emails, customer.email],
        addresses1: [...result.addresses1, customer.address.address1],
        addresses2: [...result.addresses2, customer.address.address2],
        addresses_cities: [...result.addresses_cities, customer.address.city],
        addresses_states: [...result.addresses_states, customer.address.state],
        addresses_zips: [...result.addresses_zips, customer.address.zip],
        phone1s: [...result.phone1s, customer.phone[0].number],
        phone2s: [...result.phone2s, customer.phone[1].number],
        phone3s: [...result.phone3s, customer.phone[2].number],
        note: [...result.note, customer.notes],
        customerTypes_ids: [
          ...result.customerTypes_ids,
          customer.customerType.id,
        ],
        customerTypes_codes: [
          ...result.customerTypes_codes,
          customer.customerType.code,
        ],
        customerTypes_names: [
          ...result.customerTypes_names,
          customer.customerType.name,
        ],
        contactFirstNames: [
          ...result.contactFirstNames,
          customer.contactFirstName,
        ],
        contactLastNames: [
          ...result.contactLastNames,
          customer.contactLastName,
        ],
        shopIds: [...result.shopIds, customer.shopId],
        okForMarketings: [...result.okForMarketings, customer.okForMarketing],
        createdDates: [...result.createdDates, customer.createdDate],
        updatedDates: [...result.updatedDates, customer.updatedDate],
        deletedDates: [...result.deletedDates, customer.deletedDate],
        birthdays: [...result.birthdays, customer.birthday],
      }),
      {
        ids: [] as number[],
        firstNames: [] as (string | null)[],
        lastNames: [] as (string | null)[],
        emails: [] as (string | null)[],
        addresses1: [] as (string | null)[],
        addresses2: [] as (string | null)[],
        addresses_cities: [] as (string | null)[],
        addresses_states: [] as (string | null)[],
        addresses_zips: [] as (string | null)[],
        phone1s: [] as (string | null)[],
        phone2s: [] as (string | null)[],
        phone3s: [] as (string | null)[],
        note: [] as (string | null)[],
        customerTypes_ids: [] as number[],
        customerTypes_codes: [] as (string | null)[],
        customerTypes_names: [] as (string | null)[],
        contactFirstNames: [] as (string | null)[],
        contactLastNames: [] as (string | null)[],
        shopIds: [] as number[],
        okForMarketings: [] as (boolean | null)[],
        createdDates: [] as (Date | null)[],
        updatedDates: [] as (Date | null)[],
        deletedDates: [] as (Date | null)[],
        birthdays: [] as (Date | null)[],
      },
    );
    await this.db.query(
      `
      INSERT INTO tekcustomer (
        id,
        firstName,
        lastName,
        email,
        address1,
        address2,
        address_city,
        address_state,
        address_zip,
        phone1,
        phone2,
        phone3,
        notes,
        customertype_id,
        customertype_code,
        customertype_name,
        contactfirstname,
        contactlastname,
        shopid,
        okformarketing,
        createddate,
        updateddate,
        deleteddate,
        birthday
      )
      SELECT * FROM UNNEST (
        $1::bigint[],
        $2::varchar(50)[],
        $3::varchar(50)[],
        $4::varchar(50)[],
        $5::varchar(50)[],
        $6::varchar(50)[],
        $7::varchar(50)[],
        $8::varchar(50)[],
        $9::varchar(50)[],
        $10::varchar(50)[],
        $11::varchar(50)[],
        $12::varchar(50)[],
        $13::varchar(150)[],
        $14::bigint[],
        $15::varchar(50)[],
        $16::varchar(50)[],
        $17::varchar(50)[],
        $18::varchar(50)[],
        $19::bigint[],
        $20::boolean[],
        $21::date[],
        $22::date[],
        $23::date[],
        $24::date[]
      )
      ON CONFLICT (id)
      DO UPDATE
      SET
      id = EXCLUDED.id,
      firstName = EXCLUDED.firstName,
      lastName = EXCLUDED.lastName,
      email = EXCLUDED.email,
      address1 = EXCLUDED.address1,
      address2 = EXCLUDED.address2,
      address_city = EXCLUDED.address_city,
      address_state = EXCLUDED.address_state,
      address_zip = EXCLUDED.address_zip,
      phone1 = EXCLUDED.phone1,
      phone2 = EXCLUDED.phone2,
      phone3 = EXCLUDED.phone3,
      notes = EXCLUDED.notes,
      customertype_id = EXCLUDED.customertype_id,
      customertype_code = EXCLUDED.customertype_code,
      customertype_name = EXCLUDED.customertype_name,
      contactfirstname = EXCLUDED.contactfirstname,
      contactlastname = EXCLUDED.contactlastname,
      shopid = EXCLUDED.shopid,
      okformarketing = EXCLUDED.okformarketing,
      createddate = EXCLUDED.createddate,
      updateddate = EXCLUDED.updateddate,
      deleteddate = EXCLUDED.deleteddate,
      birthday = EXCLUDED.birthday`,
      [
        customers.ids,
        customers.firstNames,
        customers.lastNames,
        customers.emails,
        customers.addresses1,
        customers.addresses2,
        customers.addresses_cities,
        customers.addresses_states,
        customers.addresses_zips,
        customers.phone1s,
        customers.phone2s,
        customers.phone3s,
        customers.note,
        customers.customerTypes_ids,
        customers.customerTypes_codes,
        customers.customerTypes_names,
        customers.contactFirstNames,
        customers.contactLastNames,
        customers.shopIds,
        customers.okForMarketings,
        customers.createdDates,
        customers.updatedDates,
        customers.deletedDates,
        customers.birthdays,
      ],
    );
  }

  async writeCustomerPageData(index: number, shop_id: number) {
    const result = await this.fetchCustomerEachPagesData(
      `/customers?page=${index}&size=300&shop=${shop_id}`,
    );

    result.flat().map(function (element) {
      if (element.address == null) {
        element.address = {
          id: null,
          address1: null,
          address2: null,
          city: null,
          state: null,
          zip: null,
        };
      }

      for (let i = 0; i < 3; i++) {
        element.phone.push({
          id: null,
          number: null,
          type: null,
          primary: null,
        });
      }
    });

    await this.writeCustomersToDB(result);
  }

  async fetchAndWriteCustomerData(shop_id: number) {
    const res = await this.apiService.fetch<{
      content: TekmetricCustomer[];
      totalPages: number;
      size: number;
    }>(`/customers?shop=${shop_id}`);

    console.log(res);

    const pageSize = res.size;
    const pageGroup = Math.floor((res.totalPages * pageSize) / 300) + 1;
    const pagesArray = new Array(pageGroup).fill(1);

    await Promise.all(
      pagesArray.map((page, index) =>
        this.writeCustomerPageData(index, shop_id),
      ),
    );

    await console.log(`${shop_id}: success`);

    // const res = await this.apiService.fetch<{
    //   content: TekmetricCustomer[];
    //   totalPages: number;
    //   size: number;
    // }>(`/customers?page=0&size=7591&shop=${shop_id}`);

    // return res.content;
  }
}
