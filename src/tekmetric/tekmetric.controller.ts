import { Controller, Get, Post, Query, Req } from "@nestjs/common";
import { wrapResponse } from "../app.controller";
import { TekmetricService } from "./tekmetric.service";
import { TekmetricJobService } from "./tekmetric.job.service";

const activeShopList = [
  398,
  1159,
  1552,
  3028,
  3586,
  3229,
  3472,
  // 293,
  // 1216,
  // 4494,
  // 888,
  // 309,
  // 2442,
  // 3543,
  // 3547,
  // 3758,
  // 3540,
  // 3539,
  // 3761,
  // 1873,
  // 3542,
  // 3541,
  // 3759,
  // 331,
  // 1692,
  // 2305,
  // 3520,
  // 1398,
  // 3351,
  // 3385,
  // 4120
  ]

@Controller("tekmetric")
export class TekmetricController {
  constructor(
    private readonly tekmetricService: TekmetricService,
    private readonly tekjobService: TekmetricJobService,
    ) {}

  @Get("/getTekReport")
  async getTekReport() {
    await Promise.all(
      activeShopList.map((id) => this.tekjobService.fetchAndWriteJobData(id))
    )

    await console.log("success")
  }
}
