import { Inject, Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer/dist";

@Injectable()
export class TekmetricSendEmailService {
  private readonly logger = new Logger(TekmetricSendEmailService.name);
  constructor(
    private readonly mailerServer: MailerService,
  ) {}

  async sendEmail(shopInfor: any[]) {
    const response = await this.mailerServer.sendMail({
      from: "api@wowcards.com",
      to: ["kirk@wowcards.com", "sandra@wowcards.com"],
      //   to: "steven@wowcards.com",
      subject: "Connected",
      template: "notification",
      context: {
        message: shopInfor,
      },
    });

    console.log(response);
    return response;
  }
}
