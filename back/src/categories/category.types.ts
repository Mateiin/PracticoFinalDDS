import { IsString, MinLength, MaxLength, IsNotEmpty, IsOptional } from "class-validator";

export interface Category {
    id: number;
    name: string;
}

//asi es la informacion que nos mandara el usuario para cerar una categoria
export class CreateCategoryInput {
    @IsString({ message: 'El nombre debe ser un texto' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(100, { message: 'El nombre no puede tener mas de 100 caracteres' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    name!: string;
}

export class UpdateCategoryInput {
    @IsOptional()
    @IsString({ message: 'El nombre debe ser un texto' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(100, { message: 'El nombre no puede tener mas de 100 caracteres' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    name?: string;
}