import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-role.enum';
@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column({ unique: true })
    email!: string;

    //Es la parte de seguridad
    @Column({ select: false })
    passwordHash!: string;

    @Column({ type: 'text', default: UserRole.USER })
    role!: UserRole;

    @CreateDateColumn()
    createdAt!: Date;

    //Verificacion de email
    @Column({ default: false })
    isEmailVerified!: boolean;

    @Column({ type:'varchar', nullable: true })
    emailVerificationToken!: string | null;

    //Recuperacion de contraseña
    @Column({ type: 'varchar', nullable: true })
    passwordResetToken!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    passwordResetTokenExpiration!: Date | null;

}