import { Controller, Get, Post, Query, Req } from "@nestjs/common";
import { wrapResponse } from "../app.controller";
import { TekmetricService } from "./tekmetric.service";
import { TekmetricJobService } from "./tekmetric.job.service";

@Controller("tekmetric")
export class TekmetricController {
  constructor(
    private readonly tekmetricService: TekmetricService,
    private readonly tekjobService: TekmetricJobService,
  ) {}

  @Get("/getTekReport")
  async getTekReport() {}
}
