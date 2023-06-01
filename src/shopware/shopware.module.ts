import { Module } from "@nestjs/common";
import { ShopwareController } from "./shopware.controller";
import { ShopwareService } from "./shopware.service";
import { ShopWareApiService } from "./api.service";

@Module({
  controllers: [ShopwareController],
  providers: [ShopwareService, ShopWareApiService],
  exports: [ShopwareService],
})
export class ShopwareModule {}
