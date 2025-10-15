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
import { QuillEditorModule } from './domains/quill-editor/quill-editor.module';
import { QuillEditor } from './domains/quill-editor/entities/quill-editor.entity';
import { CalendarModule } from './domains/calendar/calendar.module';
import { Calendar } from './domains/calendar/entities/calendar.entity';
import { Media } from './domains/media/entities/media.entity';
import { FileManagementModule } from './domains/file-management/file-management.module';
import { MediaModule } from './domains/media/media.module';
import { TableViz } from './domains/table-viz/entities/table-viz.entity';
import { CustomFormInput } from './domains/custom-form-input/entities/custom-form-input.entity';
import { TableVizModule } from './domains/table-viz/table-viz.module';
import { CustomFormInputModule } from './domains/custom-form-input/custom-form-input.module';
import { CustomTableModule } from './domains/custom-table/custom-table.module';
import { HeaderBarModule } from './domains/header-bar/header-bar.module';
import { HeaderBar } from './domains/header-bar/entities/header-bar.entity';
import { User } from './domains/user/entities/user.entity';
import { PasswordRecovery } from './core/password-recovery/entities/password-recovery.entity';
import { AuthModule } from './core/auth/auth.module';
import { UserModule } from './domains/user/user.module';
import { PasswordRecoveryModule } from './core/password-recovery/password-recovery.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: `environment/${process.env.NODE_ENV || ''}.env`,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_ADRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      }
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
        TestText,
        QuillEditor,
        Calendar,
        Media,
        TableViz,
        CustomFormInput,
        HeaderBar,
        User,
        PasswordRecovery
      ]
    }),
    NavigationModule,
    NavigationTypeModule,
    TestTextModule,
    QuillEditorModule,
    CalendarModule,
    FileManagementModule,
    MediaModule,
    TableVizModule,
    CustomFormInputModule,
    CustomTableModule,
    HeaderBarModule,
    AuthModule,
    UserModule,
    PasswordRecoveryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
