import { Test, TestingModule } from "@nestjs/testing";
import { ShopwareService } from "./shopware.service";

describe("ShopwareService", () => {
  let service: ShopwareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopwareService],
    }).compile();

    service = module.get<ShopwareService>(ShopwareService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
