import { IsString,
  IsInt,
  IsNumber,
  IsPositive,
  MinLength,
  MaxLength,
  Min,
  IsNotEmpty,
  IsOptional
} from "class-validator";

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId: number;
};

export class CreateProductInput {
  @IsString({message: 'El nombre debe ser un texto'})
  @MinLength(2, {message: 'El nombre debe tener al menos 2 caracteres'})
  @MaxLength(100, {message: 'El nombre no puede tener mas de 100 caracteres'})
  @IsNotEmpty({message: 'El nombre es requerido'})
  name!: string;

  @IsNumber({}, {message: 'El precio debe ser un numero'})
  @IsPositive({message: 'El precio debe ser mayor a 0'})
  @IsNotEmpty({message: 'El precio es requerido'})
  price!: number;

  @IsInt({message: 'El stock debe ser un numero entero'})
  @Min(0, {message: 'El stock no puede ser menor a 0'})
  @IsNotEmpty({message: 'El stock es requerido'})
  stock!: number;

  @IsInt({message: 'La categoriaId debe ser un numero entero'})
  @IsPositive()
  @IsNotEmpty()
  categoryId!: number;
}

export class UpdateProductInput {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  categoryId?: number;
};
