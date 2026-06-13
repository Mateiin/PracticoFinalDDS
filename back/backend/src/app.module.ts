import { ConfigModule} from '@nestjs/config'; //se importe ConfigModule
import { TimingMiddleware } from './common/middlewares/timing.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; //se importe TypeORM
import { CategoriesModule } from './categories/categories.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno estén disponibles en toda la aplicación
      envFilePath: ['.env'], // Especifica los archivos de entorno a cargar
    }), // Carga las variables de entorno
    
 TypeOrmModule.forRoot({
  type: 'better-sqlite3', 
  database: 'db.sqlite',// aca se llama al archivo fisico de la base de datos
  autoLoadEntities: true,// esto busca automaticamente las entidades que vayamos a crear
  synchronize: true,//crea las tablas automaticamente en la base de datos
}),
 ProductsModule, 
  CategoriesModule,
  UsersModule
], controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware, TimingMiddleware).forRoutes('*');
  }
}

