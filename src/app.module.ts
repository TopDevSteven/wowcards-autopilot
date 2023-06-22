import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { NestSessionOptions, SessionModule } from "nestjs-session";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TekmetricModule } from "./tekmetric/tekmetric.module";
import { DbModule } from "./db/db.module";
import { JobsModule } from "./jobs/jobs.module";
import { ShopwareModule } from "./shopware/shopware.module";
import { ProtractorModule } from "./protractor/protractor.module";
import { GooglesheetService } from "./googlesheet/googlesheet.service";
import { GooglesheetModule } from "./googlesheet/googlesheet.module";
import { AccuzipModule } from "./accuzip/accuzip.module";
import { CallbackModule } from "./callback/callback.module";

@Module({
  imports: [
    TekmetricModule,
    DbModule,
    JobsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    SessionModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): NestSessionOptions => ({
        session: {
          secret: config.get<string>("SESSION_SECRET", ""),
          resave: false,
          saveUninitialized: false,
        },
      }),
    }),
    ShopwareModule,
    ProtractorModule,
    GooglesheetModule,
    AccuzipModule,
    CallbackModule,
  ],
  controllers: [AppController],
  providers: [
    // Enable authentication guards globally
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => null,
    },
    AppService,
    GooglesheetService,
  ],
})
export class AppModule {}
