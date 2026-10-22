import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** Projects by sort order, then newest completion date first. */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects');
  return projects.sort(
    (a, b) => a.data.order - b.data.order || (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0),
  );
}
