import type { Usuario } from "./usuario";
import type { Comment } from "./comment";

export interface Post {
    _id: string;
    usuario?: Usuario;
    imageUrl?: string; //nse como haremos lo de las img pero de momento urls
    caption: string;
    likes: Usuario[]; // Lista de usuarios que han dado like al post
    comments: Comment[];
  };