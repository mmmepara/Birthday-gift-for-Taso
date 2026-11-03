# For Taso

A private, interactive birthday night. No accounts, no backend, no audio files. Sound is synthesized in the browser, and the wish she types is never stored.

## Before she opens it

Edit `src/content/story.ts`.

- Put your name in `signature`.
- Replace the letter, the four memories, the gifts, and the sky’s closing lines with the real ones.
- K. by Cigarettes After Sex plays quietly in the background from the official video. The record plays Surrender by Suicide, and the two crossfade.
- Photos: add images to `public/photos/`, then either set `gallery` or add `image` and `alt` on a memory.

Don’t rename the `id` fields after she has already opened the site. The browser remembers which letters she found.

## Run it

```bash
npm install
npm run dev
```

She lights each candle, then makes a wish, then blows. The microphone only works on `localhost` or `https`, and only if she chooses it. Holding the button always works.

```bash
npm test
npm run build
```

`dist/` is a static site. Host it anywhere that can serve files, or open the dev server and hand her the machine.
