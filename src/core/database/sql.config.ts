import { DEVELOPMENT, PRODUCTION } from 'src/core/constants';
import { databaseConfig } from './database.config';

let config;

switch (process.env.NODE_ENV) {
  case DEVELOPMENT:
    config = databaseConfig.development;
    break;
  case PRODUCTION:
    config = databaseConfig.production;
    break;
  default:
    config = databaseConfig.development;
}

export const sequelizeConfig = config;
