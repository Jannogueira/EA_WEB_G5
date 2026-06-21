import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PostService from '../services/post';
import type { Post } from '../models/post';

export default function usePosts() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchPosts = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      if (loading || (!isInitial && !hasNextPage)) return;

      setLoading(true);
      try {
        // Ahora pasamos la página al servicio para obtener los posts de seguidos
        const { request } = PostService.getFollowing(pageNum, 10);
        const response = await request;

        const { docs, hasNextPage: more } = response.data;

        // Acumulamos si no es la carga inicial
        setPosts((prev) => (isInitial ? docs : [...prev, ...docs]));
        setHasNextPage(more);
        setPage(pageNum);
      } catch (err) {
        setError(t('home.error_loading_posts'));
      } finally {
        setLoading(false);
      }
    },
    [loading, hasNextPage],
  );

  const fetchNextPage = () => {
    if (hasNextPage && !loading) {
      fetchPosts(page + 1);
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  return { posts, loading, error, hasNextPage, fetchNextPage };
}
