import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 
  app.use(helmet());
  app.use(compression());
  
  app.use(bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));

  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );


  app.setGlobalPrefix('api/v1');


  const config = new DocumentBuilder()
    .setTitle('Kanban Tech Challenge API')
    .setDescription('Sistema de Quadro Kanban - API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();