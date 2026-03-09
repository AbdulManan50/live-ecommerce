import { apiRequest } from "@/lib/api";

export const getLiveStreams = () => {
  return apiRequest("/api/streams/live");
};

export const startStream = (data:any) => {
  return apiRequest("/api/streams/start","POST",data);
};

export const endStream = (data:any) => {
  return apiRequest("/api/streams/end","POST",data);
};