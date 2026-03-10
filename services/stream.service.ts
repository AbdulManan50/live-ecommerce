import { apiRequest } from "@/lib/api";

export const getLiveStreams = () => {
  return apiRequest("/api/streams/live");
};

export const getStreamById = (id: string) => {
  return apiRequest(`/api/streams/${id}`);
};

export const startStream = (data: { title: string; categorySlug?: string }) => {
  return apiRequest("/api/streams/start", "POST", data);
};

export const endStream = (data: { streamId: string }) => {
  return apiRequest("/api/streams/end", "POST", data);
};