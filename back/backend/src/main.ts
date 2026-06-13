import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina cualquier dato extra que mande el usuario y no esta en la clase
    forbidNonWhitelisted: true, // Lanza un error si se envían campos no definidas
    transform: true, // Transforma el body a la clase correspondiente
    transformOptions: { enableImplicitConversion: true, // Permite la conversión de tipos de forma implícita
    },
 }));
  await app.listen(3000);
}
bootstrap();
