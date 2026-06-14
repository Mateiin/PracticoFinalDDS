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

}