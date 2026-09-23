import { Test, TestingModule } from '@nestjs/testing';
import { leagueOfLegendsService } from './leagueoflegends.service';

describe('OpenWeatherMapService', () => {
  let service: leagueOfLegendsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [leagueOfLegendsService],
    }).compile();

    service = module.get<leagueOfLegendsService>(leagueOfLegendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
