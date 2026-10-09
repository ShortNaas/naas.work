import { listType } from "./shared";

export const favorite = listType({
  name: "favorite",
  title: "Favorite",
  category: "favoriteCategory",
  categoryHint:
    "Books, YouTuber, Documentary, etc. Add new categories in Favorite Category.",
});
