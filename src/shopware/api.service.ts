import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fetch, { RequestInit, Response } from "node-fetch";

function createErrorMessage(path: string, body: unknown, method?: string) {
  return `Shopware API request failed: ${method || "GET"} ${path}
${JSON.stringify(body, null, 2)}`;
}

@Injectable()
export class ShopWareApiService {
  constructor(private configService: ConfigService) {
    this.fetch = this.fetch.bind(this);
  }
  async fetch<ShopwareResult>(
    path: string,
    options?: RequestInit,
  ): Promise<ShopwareResult> {
    const res = await fetch(
      `${this.configService.get<string>("SHOPWARE_API_ROOT")}${path}`,
      {
        headers: {
          "X-Api-Secret": `${this.configService.get<string>(
            "SHOPWARE-API-SECRET",
          )}`,
          "X-Api-Partner-Id": `${this.configService.get<string>(
            "SHOPWARE-API-PARTNER-ID",
          )}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      },
    );

    if (
      !(res.headers.get("content-type") ?? "")?.startsWith("application/json")
    ) {
      if (res.ok) {
        return undefined as ShopwareResult;
      } else {
        throw new Error(res.statusText);
      }
    } else if (res.status === 401) {
      // If the last request returned "unauthorized", re-authenticate and retry
      return await this.fetch(path, options);
    } else {
      const body: ShopwareResult = await res.json();
      if (res.ok) {
        return body;
      } else {
        throw new Error(JSON.stringify(body, null, 2));
      }
    }
  }
}
