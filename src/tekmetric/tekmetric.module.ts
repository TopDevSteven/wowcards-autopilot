import { Module , forwardRef} from "@nestjs/common";
import { TekmetricController } from "./tekmetric.controller";
import { TekmetricService } from "./tekmetric.service";
import { TekmetricShopService } from "./tekmetric.shop.service";
import { TekmetricCustomerService } from "./tekmetric.customer.service";
import { TekmetricJobService } from "./tekmetric.job.service";
import { TekmetricRepairOrderService } from "./tekmertric.repairorder.service";
import { TekmetricEmployeeService } from "./tekmetric.employee.service";
import { TekmetricSendEmailService } from "./tekmetric.sendemail.service";
import { TekmetricDeduplicate } from "./tekmetric.deduplicate.service";
import { DbModule } from "../db/db.module";
import { HttpModule } from "@nestjs/axios";
import { TekmetricApiService } from "./api.service";
import { BottleneckProvider } from "./bottleneck.provider";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import * as path from "path";

@Module({
  imports: [
    forwardRef(() => TekmetricModule),
    HttpModule,
    MailerModule.forRoot({
      transport: {
        host: "mail.wowcards.com",
        port: 465,
        ignoreTLS: false,
        secure: true,
        auth: {
          user: "api@wowcards.com",
          pass: "!&T^C!p?S]d4",
        },
      },
      template: {
        dir: path.resolve(__dirname, "..", "templates"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [TekmetricController],
  providers: [
    BottleneckProvider,
    TekmetricApiService,
    TekmetricCustomerService,
    TekmetricJobService,
    TekmetricRepairOrderService,
    TekmetricShopService,
    TekmetricEmployeeService,
    TekmetricSendEmailService,
    TekmetricDeduplicate,
    TekmetricService,
    // return types
  ],
  exports: [
    TekmetricCustomerService,
    TekmetricJobService,
    TekmetricRepairOrderService,
    TekmetricShopService,
    TekmetricEmployeeService,
    TekmetricSendEmailService,
    TekmetricApiService,
    TekmetricDeduplicate,
    TekmetricService,
  ],
})
export class TekmetricModule {}
