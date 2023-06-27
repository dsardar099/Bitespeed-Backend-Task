import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Identify } from './identify.sql.model';
import { IdentifyController } from './identify.controller';
import { IdentifyService } from './identify.service';

@Module({
  imports: [SequelizeModule.forFeature([Identify])],
  controllers: [IdentifyController],
  providers: [IdentifyService],
  exports: [IdentifyService],
})
export class IdentifyModule {}
