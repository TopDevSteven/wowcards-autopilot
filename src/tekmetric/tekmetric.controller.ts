import { Controller, Get, Query, Req } from "@nestjs/common";
import { wrapResponse } from "../app.controller";
import { TekmetricService } from "./tekmetric.service";

@Controller("tekmetric")
export class TekmetricController {
  constructor(private readonly tekmetricService: TekmetricService) {}

  @Get("/getTekReport")
  getTekReport() {
    return null;
  }

  @Get("/getTekdata")
  async getTekdate() {
    return null;
  }
}
