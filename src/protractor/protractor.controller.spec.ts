import { Test, TestingModule } from "@nestjs/testing";
import { ProtractorController } from "./protractor.controller";

describe("ProtractorController", () => {
  let controller: ProtractorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProtractorController],
    }).compile();

    controller = module.get<ProtractorController>(ProtractorController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
