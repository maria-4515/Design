import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export interface Scene {
  id: string;
  name: string;
  objects: any[];
  currentFrame: number;
  totalFrames: number;
  fps: number;
}

export function useScenes() {
  return useQuery<Scene[]>({
    queryKey: ["/api/scenes"],
  });
}

export function useScene(id: string | null) {
  return useQuery<Scene>({
    queryKey: ["/api/scenes", id],
    enabled: !!id,
  });
}

export function useCreateScene() {
  return useMutation({
    mutationFn: async (data: Omit<Scene, "id">): Promise<Scene> => {
      const response = await apiRequest("POST", "/api/scenes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scenes"] });
    },
  });
}

export function useUpdateScene() {
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Scene> & { id: string }): Promise<Scene> => {
      const response = await apiRequest("PATCH", `/api/scenes/${id}`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/scenes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scenes", variables.id] });
    },
  });
}

export function useDeleteScene() {
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/scenes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scenes"] });
    },
  });
}
