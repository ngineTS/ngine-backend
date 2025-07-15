import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationModule } from './domains/navigation/navigation.module';
import { Navigation } from './domains/navigation/entities/navigation.entity';
import { NavigationType } from './domains/navigation-type/entities/navigation-type.entity';
import { TestText } from './domains/test-text/entities/test-text.entity';
import { NavigationTypeModule } from './domains/navigation-type/navigation-type.module';
import { TestTextModule } from './domains/test-text/test-text.module';


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
        NavigationType,
        TestText
      ]
    }),
    NavigationModule,
    NavigationTypeModule,
    TestTextModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
