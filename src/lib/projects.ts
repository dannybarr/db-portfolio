import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { PROJECTS, type ProjectContent } from "@/lib/project-content";

/** A desktop tile's record: its content from the repo, plus where it sits. */
export type Project = ProjectContent & {
  /** Where a visitor dropped this folder, as a fraction of the scene box. */
  positionX: number | null;
  positionY: number | null;
};

/** The only part of a project Supabase still owns. */
type PositionRow = {
  id: number;
  position_x: number | null;
  position_y: number | null;
};

export const projectsQueryKey = ["projects"] as const;

export function useListProjects() {
  return useQuery({
    queryKey: projectsQueryKey,
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase.from("projects").select("id, position_x, position_y");
      if (error) throw error;
      const positions = new Map(((data ?? []) as PositionRow[]).map((row) => [row.id, row]));
      return [...PROJECTS]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((content) => ({
          ...content,
          positionX: positions.get(content.id)?.position_x ?? null,
          positionY: positions.get(content.id)?.position_y ?? null,
        }));
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
