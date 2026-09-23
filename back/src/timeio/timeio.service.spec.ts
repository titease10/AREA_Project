import { Test, TestingModule } from '@nestjs/testing';
import { TimeioService } from './timeio.service';

describe('TimeioService', () => {
  let service: TimeioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeioService],
    }).compile();

    service = module.get<TimeioService>(TimeioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
