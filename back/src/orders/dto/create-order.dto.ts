import { Type } from 'class-transformer';
import { IsArray, IsInt, IsPositive, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt({ message: 'El productId debe ser un número entero' })
  @IsPositive({ message: 'El productId debe ser mayor a 0' })
  productId!: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  quantity!: number;
}

export class CreateOrderDto {
  @IsArray({ message: 'Los items deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
