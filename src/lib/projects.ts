import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

/** A desktop tile's record. Mirrors the `projects` table. */
export type Project = {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  status: string;
  year: number;
  sortOrder: number;
  useCases: string[];
  url: string | null;
  previewImage: string | null;
  videoUrl: string | null;
  iconImage: string | null;
  /** Where a visitor dropped this folder, as a fraction of the scene box. */
  positionX: number | null;
  positionY: number | null;
};

type Row = {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  status: string;
  year: number;
  sort_order: number;
  use_cases: string[] | null;
  url: string | null;
  preview_image: string | null;
  video_url: string | null;
  icon_image: string | null;
  position_x: number | null;
  position_y: number | null;
};

const toProject = (row: Row): Project => ({
  id: row.id,
  code: row.code,
  title: row.title,
  description: row.description,
  category: row.category,
  status: row.status,
  year: row.year,
  sortOrder: row.sort_order,
  useCases: row.use_cases ?? [],
  url: row.url,
  previewImage: row.preview_image,
  videoUrl: row.video_url,
  iconImage: row.icon_image,
  positionX: row.position_x,
  positionY: row.position_y,
});

export const projectsQueryKey = ["projects"] as const;

export function useListProjects() {
  return useQuery({
    queryKey: projectsQueryKey,
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as Row[]).map(toProject);
    },
  });
}

/**
 * Save where a visitor dropped a folder. There is no login on this site and, by
 * explicit product decision, no guard: any visitor may rearrange the desktop and
 * that arrangement becomes the layout everybody sees.
 */
export function useUpdateProjectPosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { positionX: number; positionY: number };
    }) => {
      const { error } = await supabase
        .from("projects")
        .update({ position_x: data.positionX, position_y: data.positionY })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
