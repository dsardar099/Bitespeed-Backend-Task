/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeConfig } from './core/database/sql.config';
import { IdentifyModule } from './modules/identify/identify.module';

const ENV = process.env.NODE_ENV;
console.log('ENV: ', ENV);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env.local' : `.env.${ENV}`,
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      ...sequelizeConfig,
      synchronize: true,
      autoLoadModels: true,
    }),
    IdentifyModule,
  ],
  providers: [],
})
export class AppModule {}
