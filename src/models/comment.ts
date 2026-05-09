import type { Usuario } from "./usuario";
import type { Post } from "./post";

export interface Comment {
  _id: string;
  usuario?: Usuario;
  post: Post;
  texto: string;
  likes: string[]; // IDs of users who liked the comment
};