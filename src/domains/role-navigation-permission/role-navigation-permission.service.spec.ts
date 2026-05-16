import { Test, TestingModule } from '@nestjs/testing';
import { RoleNavigationPermissionService } from './role-navigation-permission.service';

describe('RoleNavigationPermissionService', () => {
  let service: RoleNavigationPermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleNavigationPermissionService],
    }).compile();

    service = module.get<RoleNavigationPermissionService>(RoleNavigationPermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
