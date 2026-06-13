//la T es el comodin, porque puede ser Product, Category o lo que sea en el futuro.
export interface PaginatedResult<T> {
    data: T[];// aca va el array de productos o categorias.
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
}

