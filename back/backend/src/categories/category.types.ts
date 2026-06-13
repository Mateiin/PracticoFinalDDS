export interface Category {
    id: number;
    name: string;
}

//asi es la informacion que nos mandara el usuario para cerar una categoria
export interface CreateCategoryInput {
    name: string;
}