import { useEffect, useState } from "react";
import PostService from "../services/post.service";
import type { Post } from "../models/post";

export default function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const { request } = PostService.getAll();
      const response = await request;

      const data = response.data || response;
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error cargando posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, loading, error, refetch: fetchPosts };
}