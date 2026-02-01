import { client } from "@/lib/sanity/client";
import { favoritesQuery } from "@/lib/sanity/queries";
import type { Favorite } from "@/lib/sanity/types";
import { FavoritesWithFilters } from "@/components/favorites-with-filters";

async function getFavorites(): Promise<Favorite[]> {
  const favorites = await client.fetch<Favorite[]>(favoritesQuery);
  return favorites ?? [];
}

export default async function FavoritePage() {
  const favorites = await getFavorites();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-1">
        My Favorite Things
      </h1>
      <FavoritesWithFilters favorites={favorites} />
    </div>
  );
}
