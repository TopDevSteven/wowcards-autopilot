import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fetch from "node-fetch";
import Limiter from "bottleneck";
const crypto = require("crypto");
import { XMLParser } from "fast-xml-parser";

function createErrorMessage() {
  return `Protractor API request failed`;
}

@Injectable()
export class ProtractorApiService {
  constructor(
    private configService: ConfigService,
    @Inject("Bottleneck") private limiter: Limiter,
  ) {}

  async fetchProtractor(startDate: string, endDate: string) {
    const apiKey = `${this.configService.get<string>("PROTRACTOR_API_KEY")}`;
    const connectionId = `${this.configService.get<string>(
      "PROTRACTOR_CONNECTED_ID",
    )}`;

    let authentication = crypto.createHmac(
      "sha1",
      apiKey.toString().toLowerCase(),
    );

    authentication.update(connectionId.toString().toLowerCase(), "utf8");
    const Auth = authentication.digest("base64");
    try {
      const res = this.limiter.schedule(() =>
        fetch(
          `https://integration.protractor.com/ExternalCRM/1.0/GetCRMData.ashx?connectionId=${connectionId}&apiKey=${apiKey}&authentication=${Auth}&format=json&startDate=${startDate}&endDate=${endDate}`,
          {
            method: "GET",
            headers: {
              Accept: "application/xml",
            },
          },
        ),
      );

      const response = await (await res).text();
      const parser = new XMLParser();
      const json = parser.parse(response);

      return json;
    } catch {
      throw new Error(createErrorMessage());
    }
  }
}
