import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail({}, { message: 'El nuevo email no es válido' })
  @IsNotEmpty({ message: 'El nuevo email es requerido' })
  newEmail!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  currentPassword!: string;
}
