import { Module } from "@nestjs/common";
import { CategoriesController } from "./controllers/categories.controller";
import { CategoriesService } from "./services/categories.service";
import { CATEGORIES_REPOSITORY } from "./repositories/categories.repository";
import { InMemoryCategoriesRepository } from "./repositories/in-memory-categories.repository";

@Module({
    controllers: [CategoriesController],
    providers: [
        CategoriesService,
        // aca le decimos a NestJS: "cuando alguien pidea el contrato CATEGIRIES_REPOSITORY"
        // entregarle el trabajador InMemoryCategoriesRepository
        {
            provide: CATEGORIES_REPOSITORY,
            useClass: InMemoryCategoriesRepository,
        },
    ],
    //exportamos el servicio por si otro modulo nescesita usarlo mas adelante
    exports: [CategoriesService],
})
export class CategoriesModule {}

