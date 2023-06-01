import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ConfigService } from "@nestjs/config";
import { TekmetricApiService } from "./api.service";

type TekmetricEmployee = {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  address: {
    id: number;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    fullAddress: string | null;
    streetAddress: string | null;
  } | null;
  employeeRole: {
    id: number;
    code: string | null;
    name: string | null;
  };
  employeePayType: {
    id: number;
    code: string | null;
    name: string | null;
  };
  salary: number;
  hourlyRate: number;
  disabled: boolean;
  canPerformWork: boolean;
  createdDate: Date;
  updatedDate: Date;
};

const successfulShops = new Array();

@Injectable()
export class TekmetricEmployeeService {
  private readonly logger = new Logger(TekmetricEmployeeService.name);
  constructor(
    private configService: ConfigService,
    private readonly apiService: TekmetricApiService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async fetchEmployeeEachPageDate(url: string) {
    const res = await this.apiService.fetch<{
      content: TekmetricEmployee[];
    }>(url);

    return res.content;
  }

  async writeEmployeeToDB(
    tekmetricemployee: TekmetricEmployee[],
    shopIDs: any[],
  ) {
    const employees = tekmetricemployee.reduce(
      (result, employee) => ({
        ids: [...result.ids, employee.id],
        types: [...result.types, employee.employeeRole.code],
        firstnames: [...result.firstnames, employee.firstName],
        lastnames: [...result.lastnames, employee.lastName],
        emails: [...result.emails, employee.email],
        address1s: [
          ...result.address1s,
          employee.address ? employee.address.address1 : null,
        ],
        address2s: [
          ...result.address2s,
          employee.address ? employee.address.address2 : null,
        ],
        cities: [
          ...result.cities,
          employee.address ? employee.address.city : null,
        ],
        states: [
          ...result.states,
          employee.address ? employee.address.state : null,
        ],
        zips: [...result.zips, employee.address ? employee.address.zip : null],
        fullAddresses: [
          ...result.fullAddresses,
          employee.address ? employee.address.fullAddress : null,
        ],
        streetAddresses: [
          ...result.streetAddresses,
          employee.address ? employee.address.streetAddress : null,
        ],
      }),
      {
        ids: [] as number[],
        types: [] as (string | null)[],
        firstnames: [] as (string | null)[],
        lastnames: [] as (string | null)[],
        emails: [] as (string | null)[],
        address1s: [] as (string | null)[],
        address2s: [] as (string | null)[],
        cities: [] as (string | null)[],
        states: [] as (string | null)[],
        zips: [] as (string | null)[],
        fullAddresses: [] as (string | null)[],
        streetAddresses: [] as (string | null)[],
      },
    );
    await this.db.query(
      `
        INSERT INTO tekemployee (
            id,
            type,
            firstname,
            lastname,
            email,
            address1,
            address2,
            city,
            state,
            zip,
            fulladdress,
            streetaddress,
            shpid
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
            $13::int[]
        )
        ON CONFLICT (id)
        DO UPDATE
        SET
        id = EXCLUDED.id,
        type = EXCLUDED.type,
        firstname = EXCLUDED.firstname,
        lastname = EXCLUDED.lastname,
        email = EXCLUDED.email,
        address1 = EXCLUDED.address1,
        address2 = EXCLUDED.address2,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        zip = EXCLUDED.zip,
        fulladdress = EXCLUDED.fulladdress,
        streetaddress = EXCLUDED.streetaddress,
        shpid = EXCLUDED.shpid`,
      [
        employees.ids,
        employees.types,
        employees.firstnames,
        employees.lastnames,
        employees.emails,
        employees.address1s,
        employees.address2s,
        employees.cities,
        employees.states,
        employees.zips,
        employees.fullAddresses,
        employees.streetAddresses,
        shopIDs,
      ],
    );
  }

  async writeEmployeePageDate(index: number, shop_id: number) {
    const result = await this.fetchEmployeeEachPageDate(
      `/employees?page=${index}&size=300&shop=${shop_id}`,
    );

    const shopIDs = new Array(result.length).fill(shop_id);

    await this.writeEmployeeToDB(result, shopIDs);
  }

  async fetchAndWriteEmployee(shop_id: number) {
    const res = await this.apiService.fetch<{
      content: TekmetricEmployee[];
      totalPages: number;
      size: number;
    }>(`/employees?shop=${shop_id}`);

    console.log(res);

    const pageSize = res.size;
    const pageGroup = Math.floor((res.totalPages * pageSize) / 300) + 1;
    const pagesArray = new Array(pageGroup).fill(1);

    await Promise.all(
      pagesArray.map((page, index) =>
        this.writeEmployeePageDate(index, shop_id),
      ),
    );

    await successfulShops.push(shop_id);
    await console.log(successfulShops);
  }
}
