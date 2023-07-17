import { Test, TestingModule } from "@nestjs/testing";
import { AccuzipController } from "./accuzip.controller";

describe("AccuzipController", () => {
  let controller: AccuzipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccuzipController],
    }).compile();

    controller = module.get<AccuzipController>(AccuzipController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
