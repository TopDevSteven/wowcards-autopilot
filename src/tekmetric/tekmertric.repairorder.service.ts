import { CustomDecorator, Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ConfigService } from "@nestjs/config";
import { TekmetricApiService } from "./api.service";

type TekRepairOrders = {
  id: number;
  repairOrderNumber: number | null;
  shopId: number;
  repairOrderStatus: JSON | null;
  repairOrderCustomLabel: JSON | null;
  color: string | null;
  appointmentStartTime: Date | null;
  customerId: number | null;
  technicianId: number | null;
  serviceWriterId: number | null;
  vehicleId: number | null;
  milesIn: number | null;
  milesOut: number | null;
  keytag: string | null;
  completedDate: Date | null;
  postedDate: Date | null;
  laborSales: number | null;
  partsSales: number | null;
  subletSales: number | null;
  discountTotal: number | null;
  feeTotal: number | null;
  taxes: number | null;
  amountPaid: number | null;
  totalSales: number | null;
  jobs: JSON | null;
  sublets: JSON | null;
  fees: JSON | null;
  discounts: JSON | null;
  customerConcerns: JSON | null;
  createdDate: Date | null;
  updatedDate: Date | null;
  deletedDate: Date | null;
  estimateShareDate: Date | null;
  customerTimeOut: string | null;
  estimateUrl: string | null;
  inspectionUrl: string | null;
  invoiceUrl: string | null;
  leadSource: string | null;
};

@Injectable()
export class TekmetricRepairOrderService {
  private readonly logger = new Logger(TekmetricRepairOrderService.name);
  constructor(
    private configService: ConfigService,
    private readonly apiService: TekmetricApiService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async fetchRepariOrderEachPagesData(url: string) {
    const res = await this.apiService.fetch<{
      content: TekRepairOrders[];
    }>(url);

    return res.content;
  }

  async writeRepairOrderPageData(index: number, shop_id: number) {
    const result = await this.fetchRepariOrderEachPagesData(
      `/repair-orders?page=${index}&size=300&shop=${shop_id}`,
    );
    console.log(result);
    await this.writeRepairOrdersToDB(result);
  }

  async writeRepairOrdersToDB(tekrepareorders: TekRepairOrders[]) {
    const repairorders = tekrepareorders.reduce(
      (result, repairorder) => ({
        ids: [...result.ids, repairorder.id],
        amountPaids: [...result.amountPaids, repairorder.amountPaid],
        customerIds: [...result.customerIds, repairorder.customerId],
        totalSales: [...result.totalSales, repairorder.totalSales],
        postedDates: [...result.postedDates, repairorder.postedDate],
      }),
      {
        ids: [] as number[],
        amountPaids: [] as (number | null)[],
        customerIds: [] as (number | null)[],
        totalSales: [] as (number | null)[],
        postedDates: [] as (Date | null)[],
      },
    );

    await this.db.query(
      `
        INSERT INTO tekrepairorder (
          id,
          customerid,
          amountpaid,
          totalsales,
          posteddate
        )
        SELECT * FROM UNNEST (
          $1::bigint[],
          $2::bigint[],
          $3::bigint[],
          $4::bigint[],
          $5::date[]
        )
        ON CONFLICT (id)
        DO UPDATE
        SET
        customerid = EXCLUDED.customerid,
        amountpaid = EXCLUDED.amountpaid,
        totalSales = EXCLUDED.totalsales,
        posteddate = EXCLUDED.posteddate`,
      [
        repairorders.ids,
        repairorders.customerIds,
        repairorders.amountPaids,
        repairorders.totalSales,
        repairorders.postedDates,
      ],
    );
  }

  async fetchAndWriteRepairOrderData(shop_id: number) {
    const res = await this.apiService.fetch<{
      content: TekRepairOrders[];
      totalPages: number;
      size: number;
    }>(`/repair-orders?shop=${shop_id}`);

    const pageSize = res.size;
    const pageGroup = Math.floor((res.totalPages * pageSize) / 300) + 1;
    const pagesArray = new Array(pageGroup).fill(1);

    await Promise.all(
      pagesArray.map((page, index) =>
        this.writeRepairOrderPageData(index, shop_id),
      ),
    );

    console.log(`${shop_id}: success`);

    // const customerData = await Promise.all(
    //     pagesArray.map((page, index) =>
    //       this.fetchRepariOrderEachPagesData(
    //         `/repair-orders?page=${index}&size=200&shop=${shop_id}`,
    //       ),
    //     ),
    //   );

    // return customerData.flat();
  }
}
