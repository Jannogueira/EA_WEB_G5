import { useState, useEffect } from "react";
import PostService from "../services/post";
import CommentService from "../services/comment";
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
      comments: (initialPost.comments ?? []).map(c => ({
        ...c,
        likes: c.likes ?? []
      })),
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
        comments: [...prev.comments, { ...res.data, likes: [] }],
      }));
    } catch (err) {
      setError("Error al crear comentario");
    } finally {
      setLoadingComment(false);
    }
  };

  const likeComment = async (commentId: string) => {
    try {
      const res = await CommentService.like(commentId);
      // Backend returns the updated comment
      setPost(prev => ({
        ...prev,
        comments: prev.comments.map(c => 
          c._id === commentId ? { ...c, likes: res.data.likes } : c
        ),
      }));
    } catch (err) {
      setError("Error al dar like al comentario");
    }
  };

  return {
    post,
    likePost,
    likeComment,
    addComment,
    loadingComment,
    error,
  };
}