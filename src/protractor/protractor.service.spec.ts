import { Test, TestingModule } from "@nestjs/testing";
import { ProtractorService } from "./protractor.service";

describe("ProtractorService", () => {
  let service: ProtractorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProtractorService],
    }).compile();

    service = module.get<ProtractorService>(ProtractorService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
