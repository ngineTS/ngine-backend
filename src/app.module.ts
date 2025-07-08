import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationModule } from './domains/navigation/navigation.module';
import { Navigation } from './domains/navigation/entities/navigation.entity';
import { NavigationType } from './domains/navigation_type/entities/navigation_type.entity';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: `environment/${process.env.NODE_ENV || ''}.env`,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10) || 1433,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
      entities: [   
        Navigation,
        NavigationType
      ]
    }),
    NavigationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
