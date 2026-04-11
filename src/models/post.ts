import type { Usuario } from "./usuario";
import type { Comment } from "./comment";

export interface Post {
    _id: number;
    usuario: Usuario;
    imageUrl?: string; //nse como haremos lo de las img pero de momento urls
    caption: string;
    likes: number;
    comments: Comment[];
  };