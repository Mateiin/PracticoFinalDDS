import * as fs from 'fs';
import * as path from 'path';
import { UsersGateway } from './users.gateway';
import { ExternalUser } from '../user.types';
import { NotFoundException } from '@nestjs/common';

export class LocalUsersGateway implements UsersGateway {

    //metodo auxiliar privado para no repetir el codigo de lectura
    private readJsonFile(): ExternalUser[] {
        const filePath = path.join(process.cwd(), 'src/users/data/users.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }

    //1. metodo para traer todos los usuarios
    async fetchAll(): Promise<ExternalUser[]> {
        const users = this.readJsonFile();
        return users;
    } 

    //2. metodo para traer un usuario por ID
    async fetchById(id: number): Promise<ExternalUser> {
        const users = this.readJsonFile();
        const user = users.find((u) => u.id === id);

        if (!user) {
            // si no encuentra el usuario en el JSON local, se lanza un error 404
            throw new NotFoundException(`Usuario con id ${id} no encontrado`);
        }

        return user;
    }
}
