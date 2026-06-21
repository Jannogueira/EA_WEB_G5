import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PostService from '../services/post';
import type { Post } from '../models/post';

export default function useSavedPostsFeed() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);

  const pageRef = useRef(1);

  const fetchSavedPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      if (reset) {
        pageRef.current = 1;
      }

      const res = await PostService.getSaved(pageRef.current, 10);

      const data = res.data;
      const newPosts = data.docs || data.results || data;

      setPosts((prev) => {
        if (reset) return newPosts;

        const map = new Map();

        [...prev, ...newPosts].forEach((p) => {
          map.set(p._id, p);
        });

        return Array.from(map.values());
      });

      setHasNextPage(data.hasNextPage ?? false);

      pageRef.current += 1;
    } catch (err) {
      setError(t('saved_posts.error_loading'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedPosts(true);
  }, [fetchSavedPosts]);

  const fetchNextPage = () => {
    if (!loading && hasNextPage) {
      fetchSavedPosts(false);
    }
  };

  return {
    posts,
    loading,
    error,
    hasNextPage,
    fetchNextPage,
    refresh: () => fetchSavedPosts(true),
  };
}
