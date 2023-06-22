import { Module } from "@nestjs/common";
import { ShopwareController } from "./shopware.controller";
import { ShopwareService } from "./shopware.service";
import { ShopWareApiService } from "./api.service";
import { ShopwareCustomerService } from "./shopware.customer.service";
import { ShopwareRepairOrderService } from "./shopware.repairorders.service";
import { ShopwareShopService } from "./shopware.shop.service";
import { ShopWareDeduplicate } from "./shopware.deduplicate.service";

@Module({
  controllers: [ShopwareController],
  providers: [
    ShopwareService, 
    ShopWareApiService, 
    ShopwareCustomerService,
    ShopwareRepairOrderService,
    ShopwareShopService,
    ShopWareDeduplicate,
  ],
  exports: [
    ShopwareService, 
    ShopwareCustomerService, 
    ShopWareApiService,
    ShopwareRepairOrderService,
    ShopwareShopService,
    ShopWareDeduplicate,
  ],
})
export class ShopwareModule {}
