import { Module } from '@nestjs/common';
import { HeaderBarService } from './header-bar.service';
import { HeaderBarController } from './header-bar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderBar } from './entities/header-bar.entity';

@Module({
  imports:[TypeOrmModule.forFeature([HeaderBar])],
  controllers: [HeaderBarController],
  providers: [HeaderBarService],
})
export class HeaderBarModule {}
