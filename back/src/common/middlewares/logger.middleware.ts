import { Injectable, NestMiddleware }  from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const time = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    //Iprimimos la información en la consola
    console.log(`[LOG] Metodo: ${req.method} | URL: ${req.originalUrl} | Hora: ${time}`);
   
    //Llamamos al siguiente middleware o controlador
    next();
  }
}