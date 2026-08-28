# Assets

Drop real files here, then run `npm run assets:upload` to push them to Supabase Storage.

| Folder       | Bucket      | For                                                  |
| ------------ | ----------- | ---------------------------------------------------- |
| `media/`     | `media`     | Product and project covers, gallery images, photos   |
| `logos/`     | `logos`     | Featured-in logos. Monochrome SVG, one visual height |
| `documents/` | `documents` | The CV, engineering project reports                  |

The path inside the folder becomes the path inside the bucket, so
`content/assets/media/rubric/cover.png` uploads to `media/rubric/cover.png`, and that
is exactly the string that goes in the row's `cover_image_path`.

Nothing here is committed except this file — real assets are gitignored, because a
repository is a poor place to store binaries that already live in Storage.

## Currently expected

Nothing is wired up yet. When these arrive, the paths should be:

| File               | Put it at                                         | Fills                                   |
| ------------------ | ------------------------------------------------- | --------------------------------------- |
| Fadi's CV          | `documents/cv.pdf`                                | `site_settings.cv_path`                 |
| Rubric screenshot  | `media/rubric/cover.png`                          | `products.cover_image_path`             |
| Street light photo | `media/intelligent-street-light-system/cover.jpg` | `engineering_projects.cover_image_path` |
| Web Summit photo   | `media/web-summit-qatar-2026-talk/cover.jpg`      | `achievements.media`                    |
