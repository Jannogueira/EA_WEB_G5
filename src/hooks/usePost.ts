import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PostService from '../services/post';
import CommentService from '../services/comment';
import type { Post } from '../models/post';

export default function usePost(initialPost: Post) {
  const { t } = useTranslation();
  const [post, setPost] = useState<Post>({
    ...initialPost,
    comments: initialPost.comments ?? [],
    likes: initialPost.likes ?? [],
  });

  const [loadingComment, setLoadingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    setPost({
      ...initialPost,
      comments: (initialPost.comments ?? []).map((c) => ({
        ...c,
        likes: c.likes ?? [],
      })),
      likes: initialPost.likes ?? [],
    });

    let savedVal = initialPost.isSaved;
    if (savedVal === undefined) {
      try {
        const uStr = localStorage.getItem('usuario');
        if (uStr) {
          const u = JSON.parse(uStr);
          const savedIds = u.postsGuardados || u.savedPosts || [];
          savedVal = savedIds.some((id: any) => (id._id || id) === initialPost._id);
        }
      } catch {
        savedVal = false;
      }
    }
    setIsSaved(savedVal ?? false);
  }, [initialPost]);

  const likePost = async () => {
    try {
      const res = await PostService.darleLike(post._id);

      setPost((prev) => ({
        ...prev,
        likes: res.data.likes,
      }));
    } catch {
      setError(t('alerts.postcard.like_error'));
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

      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, { ...res.data, likes: [] }],
      }));
    } catch {
      setError(t('alerts.postcard.comment_error'));
    } finally {
      setLoadingComment(false);
    }
  };

  const likeComment = async (commentId: string) => {
    try {
      const res = await CommentService.like(commentId);

      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c._id === commentId ? { ...c, likes: res.data.likes } : c,
        ),
      }));
    } catch {
      setError(t('alerts.postcard.comment_like_error'));
    }
  };

  const toggleSave = async () => {
    setError(null);
    try {
      const res = await PostService.toggleSave(post._id);

      setIsSaved(res.data.saved);

      try {
        const uStr = localStorage.getItem('usuario');
        if (uStr) {
          const u = JSON.parse(uStr);
          if (!u.postsGuardados) u.postsGuardados = [];
          if (res.data.saved) {
            if (!u.postsGuardados.includes(post._id)) {
              u.postsGuardados.push(post._id);
            }
          } else {
            u.postsGuardados = u.postsGuardados.filter((id: any) => (id._id || id) !== post._id);
          }
          localStorage.setItem('usuario', JSON.stringify(u));
        }
      } catch (e) {
        setError(t('alerts.profile.action_failed'));
      }

      return res.data.saved;
    } catch (err) {
      setError(t('alerts.postcard.save_error'));
      return null;
    }
  };

  return {
    post,
    likePost,
    likeComment,
    addComment,
    loadingComment,
    error,
    toggleSave,
    isSaved,
  };
}
