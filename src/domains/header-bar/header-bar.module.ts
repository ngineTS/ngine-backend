import { Module } from '@nestjs/common';
import { HeaderBarService } from './header-bar.service';
import { HeaderBarController } from './header-bar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderBar } from './entities/header-bar.entity';
import { NavigationModule } from '../navigation/navigation.module';

@Module({
  imports:[TypeOrmModule.forFeature([HeaderBar]), NavigationModule],
  controllers: [HeaderBarController],
  providers: [HeaderBarService],
})
export class HeaderBarModule {}
