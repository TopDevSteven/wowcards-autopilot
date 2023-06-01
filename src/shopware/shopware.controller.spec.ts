import { Test, TestingModule } from "@nestjs/testing";
import { ShopwareController } from "./shopware.controller";

describe("ShopwareController", () => {
  let controller: ShopwareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopwareController],
    }).compile();

    controller = module.get<ShopwareController>(ShopwareController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
