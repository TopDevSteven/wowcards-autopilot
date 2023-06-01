import { Module } from "@nestjs/common";
import { ProtractorService } from "./protractor.service";
import { ProtractorController } from "./protractor.controller";
import { ProtractorApiService } from "./api.service";
import { ProtractorContactService } from "./protractor.contact.service";
import { ProtractorInvoiceService } from "./protractor.invoice.service";
import { ProtractorServiceItemService } from "./protrator.serviceitem.service";
import { BottleneckProvider } from "./bottleneck.provider";

@Module({
  controllers: [ProtractorController],
  providers: [
    BottleneckProvider,
    ProtractorService,
    ProtractorApiService,
    ProtractorContactService,
    ProtractorInvoiceService,
    ProtractorServiceItemService,
  ],
  exports: [
    ProtractorService,
    ProtractorContactService,
    ProtractorInvoiceService,
    ProtractorServiceItemService,
  ],
})
export class ProtractorModule {}
