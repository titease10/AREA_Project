import { Test, TestingModule } from '@nestjs/testing';
import { AirqualityService } from './airquality.service';

describe('AirqualityService', () => {
  let service: AirqualityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirqualityService],
    }).compile();

    service = module.get<AirqualityService>(AirqualityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
