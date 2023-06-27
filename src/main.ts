/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prettier/prettier */
import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const fastifyHelmet = require('@fastify/helmet');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 90000000,
    }),
    { rawBody: true },
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
      },
    },
  });

  app.enableCors({
    allowedHeaders: [
      'Origin',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
      'X-Requested-With',
      'Content-Type',
      'Accept',
    ],
    origin: ['*'],
    methods: ['HEAD', 'OPTIONS', 'GET', 'PUT', 'POST', 'DELETE'],
  });

  const config = new DocumentBuilder()
    .setTitle('Bitespeed Backend Task')
    .setDescription('Bitespeed Backend Task: Identity Reconciliation')
    .build();

  const doucment = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, doucment);

  await app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log('SERVER UP ', process.env.PORT);
  });
}
bootstrap();
