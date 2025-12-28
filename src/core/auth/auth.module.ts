import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordRecovery } from 'src/core/password-recovery/entities/password-recovery.entity';
import { User } from 'src/domains/user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { NavigationService } from 'src/domains/navigation/navigation.service';
import { Navigation } from 'src/domains/navigation/entities/navigation.entity';
import { NavigationType } from 'src/domains/navigation-type/entities/navigation-type.entity';
import { HeaderBar } from 'src/domains/header-bar/entities/header-bar.entity';
import { RoleNavigationPermission } from 'src/domains/role-navigation-permission/entities/role-navigation-permission.entity';

@Module({
  imports:[
    ConfigModule.forRoot({
      envFilePath: `environment/${process.env.NODE_ENV || ''}.env`,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    TypeOrmModule.forFeature([
      User,
      PasswordRecovery,
      Navigation,
      NavigationType,
      HeaderBar,
      RoleNavigationPermission
    ])
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    NavigationService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },  
  ]
})
export class AuthModule {}
