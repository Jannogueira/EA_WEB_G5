import { useState } from "react";
import PostService from "../services/post.service";

export default function useCreatePost() {
  const [loading, setLoading] = useState(false);

  const createPost = async (data: { imageUrl: string; caption: string }) => {
    setLoading(true);

    try {
      const res = await PostService.createPost(data);
      return res.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createPost, loading };
}