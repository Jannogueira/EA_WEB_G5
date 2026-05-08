import { useEffect, useState, useCallback } from "react";
import PostService from "../services/post";
import type { Post } from "../models/post";

export default function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchPosts = useCallback(async (pageNum: number, isInitial: boolean = false) => {
    if (loading || (!isInitial && !hasNextPage)) return;

    setLoading(true);
    try {
      // Ahora pasamos la página al servicio para obtener los posts de seguidos
      const { request } = PostService.getFollowing(pageNum, 10);
      const response = await request;

      console.log("DEBUG: Datos recibidos en usePosts:", response.data);

      const { docs, hasNextPage: more } = response.data;

      // Acumulamos si no es la carga inicial
      setPosts(prev => isInitial ? docs : [...prev, ...docs]);
      setHasNextPage(more);
      setPage(pageNum);
    } catch (err) {
      console.error("Error en fetchPosts:", err);
      setError("Error cargando posts");
    } finally {
      setLoading(false);
    }
  }, [loading, hasNextPage]);

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