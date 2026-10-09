import { listType } from "./shared";

export const favorite = listType({
  name: "favorite",
  title: "Favorite",
  category: "favoriteCategory",
  categoryHint: "Categories live under Favorites → Categories.",
});
