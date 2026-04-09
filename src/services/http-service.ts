import apiClient from "./api-client";

type EntityWithId = { id: number } | { _id: string };

class HttpService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll<T>() {
    const controller = new AbortController();
    const request = apiClient.get<T[]>(this.endpoint, {
      signal: controller.signal,
    });
    return { request, cancel: () => controller.abort() };
  }

  delete(id: string | number) {
    return apiClient.delete(this.endpoint + "/" + id);
  }

  create<T>(entity: T) {
    return apiClient.post(this.endpoint, entity);
  }

  update<T extends EntityWithId>(entity: T) {
    // Get the ID for the URL path
    const entityId = "_id" in entity ? entity._id : entity.id;

    // Create a clean payload for the request body
    const payload = { ...entity };

    // Delete fields that the backend typically manages and rejects in PUT requests
    delete (payload as any)._id;
    delete (payload as any).id;
    delete (payload as any).createdAt;
    delete (payload as any).updatedAt;
    delete (payload as any).__v; // Also common in Mongoose

    return apiClient.put(this.endpoint + "/" + entityId, payload);
  }
}

const create = (endpoint: string) => new HttpService(endpoint);

export default create;
