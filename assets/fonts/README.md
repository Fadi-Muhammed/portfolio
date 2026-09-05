# Fonts for the Open Graph images

Three static instances, used only by `next/og` when it renders a share card on the
server. They are never sent to a browser — the site itself loads Archivo and IBM Plex
Mono through `next/font/google`, which subsets and self-hosts them (see `src/lib/fonts.ts`).

They exist as files because Satori, the renderer behind `ImageResponse`, needs real font
data and cannot select an axis on a variable font. Google Fonts will serve a static
instance at an exact axis position, which is how the display face here keeps the width
the design actually uses:

| File                 | Family        | Axes                    | Matches                        |
| -------------------- | ------------- | ----------------------- | ------------------------------ |
| `archivo-display.ttf`| Archivo       | `wdth 118`, `wght 600`  | `--wdth-display`, `text-h1`    |
| `archivo-body.ttf`   | Archivo       | `wdth 100`, `wght 400`  | `--wdth-body`, body copy       |
| `plex-mono.ttf`      | IBM Plex Mono | `wght 500`              | `text-data`                    |

Both families are licensed under the SIL Open Font License 1.1, which permits
redistribution in a bundle like this one:

- Archivo — Copyright 2019 The Archivo Project Authors
  (https://github.com/Omnibus-Type/Archivo)
- IBM Plex Mono — Copyright 2017 IBM Corp. (https://github.com/IBM/plex)

The full licence text is at https://openfontlicense.org. Neither font is modified, and
neither is sold.
