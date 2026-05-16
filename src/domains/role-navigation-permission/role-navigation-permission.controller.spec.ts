import { Test, TestingModule } from '@nestjs/testing';
import { RoleNavigationPermissionController } from './role-navigation-permission.controller';
import { RoleNavigationPermissionService } from './role-navigation-permission.service';

describe('RoleNavigationPermissionController', () => {
  let controller: RoleNavigationPermissionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleNavigationPermissionController],
      providers: [RoleNavigationPermissionService],
    }).compile();

    controller = module.get<RoleNavigationPermissionController>(RoleNavigationPermissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
