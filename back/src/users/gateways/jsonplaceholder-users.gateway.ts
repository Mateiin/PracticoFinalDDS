import axios from 'axios';
import { ExternalUser } from '../user.types';
import { UsersGateway } from './users.gateway';
import { NotFoundError } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

export class JsonPlaceholderUsersGateway implements UsersGateway {
  async fetchAll(): Promise<ExternalUser[]> {
    const { data } = await axios.get<ExternalUser[]>(
      'https://jsonplaceholder.typicode.com/users',
    );
    return data;
  }

  //src/users/gateways/jsonplaceholder-users.gateway.ts

  async fetchById(id: number): Promise<ExternalUser> {
    try {
      // hacemos la paeticion a la URL externa usando el ID que recibimos
      const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`);
      return response.data;
    } catch (error) {
      // si la API de afuera nos responde con un error, lo lanzamos para que el servicio lo capture
      throw error;
    }
  }
}



