import { Module } from '@nestjs/common';
import { HeaderBarService } from './header-bar.service';
import { HeaderBarController } from './header-bar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderBar } from './entities/header-bar.entity';
import { Navigation } from '../navigation/entities/navigation.entity';
import { NavigationService } from '../navigation/navigation.service';

@Module({
  imports:[TypeOrmModule.forFeature([HeaderBar, Navigation])],
  controllers: [HeaderBarController],
  providers: [HeaderBarService, NavigationService],
})
export class HeaderBarModule {}
