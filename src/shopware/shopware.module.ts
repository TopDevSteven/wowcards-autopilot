import { Module } from "@nestjs/common";
import { ShopwareController } from "./shopware.controller";
import { ShopwareService } from "./shopware.service";
import { ShopWareApiService } from "./api.service";
import { ShopwareCustomerService } from "./shopware.customer.service";
import { ShopwareRepairOrderService } from "./shopware.repairorders.service";
import { ShopwareShopService } from "./shopware.shop.service";
import { ShopWareDeduplicate } from "./shopware.deduplicate.service";
import { SWBdayService } from "./shopware.bday.service";

@Module({
  controllers: [ShopwareController],
  providers: [
    ShopwareService,
    ShopWareApiService,
    ShopwareCustomerService,
    ShopwareRepairOrderService,
    ShopwareShopService,
    ShopWareDeduplicate,
    SWBdayService,
  ],
  exports: [
    ShopwareService,
    ShopwareCustomerService,
    ShopWareApiService,
    ShopwareRepairOrderService,
    ShopwareShopService,
    ShopWareDeduplicate,
    SWBdayService,
  ],
})
export class ShopwareModule {}
