import { useState, useEffect } from "react";
import PostService from "../services/post.service";
import CommentService from "../services/comment.service";
import type { Post } from "../models/post";

export default function usePost(initialPost: Post) {
  const [post, setPost] = useState<Post>({
    ...initialPost,
    comments: initialPost.comments ?? [],
    likes: initialPost.likes ?? [],
  });

  const [loadingComment, setLoadingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPost({
      ...initialPost,
      comments: initialPost.comments ?? [],
      likes: initialPost.likes ?? [],
    });
  }, [initialPost]);

  const likePost = async () => {
    try {
      const res = await PostService.darleLike(post._id);

      setPost(prev => ({
        ...prev,
        likes: res.data.likes,
      }));
    } catch (err) {
      setError("Error al dar like");
    }
  };

  const addComment = async (text: string) => {
    if (!text.trim()) return;

    setLoadingComment(true);
    setError(null);

    try {
      const res = await CommentService.create({
        post: post._id,
        texto: text,
      });

      setPost(prev => ({
        ...prev,
        comments: [...prev.comments, res.data],
      }));
    } catch (err) {
      setError("Error al crear comentario");
    } finally {
      setLoadingComment(false);
    }
  };

  return {
    post,
    likePost,
    addComment,
    loadingComment,
    error,
  };
}