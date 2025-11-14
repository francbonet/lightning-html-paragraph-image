# lightningjs-html-paragraph-image

Small helper library for **LightningJS 2** that lets you render HTML/text
paragraphs to a bitmap using `html2canvas`, and then use that bitmap as an
`ImageTexture` inside a Lightning component.

It gives you:

- `renderParagraphToDataUrl(opts)` – low-level function that returns a PNG data URL.
- `HtmlParagraphImage` – a `Lightning.Component` that wraps the above and sets
  its own texture/size automatically.

> ⚠️ This library is meant to be used **in the browser** (inside a LightningJS
> app). It relies on `document` and `html2canvas`.

---

## Installation

```bash
npm install lightningjs-html-paragraph-image html2canvas
# or
yarn add lightningjs-html-paragraph-image html2canvas
```

You also need `@lightningjs/sdk` in your app (it is declared as a peer dependency).

---

## Basic usage

```ts
import { HtmlParagraphImage } from "lightningjs-html-paragraph-image";

// inside a LightningJS component
this.tag("content").childList.a({
  type: HtmlParagraphImage,
  x: 120,
  y: 220,
  content: {
    html: `
      <div style="margin-bottom:24px;">
        <p style="margin-bottom: 16px;">Your watchlist is empty 😢</p>
        <ul style="padding-left:32px; margin:0;">
          <li>Add series and films you want to watch</li>
          <li>They will appear here to continue later</li>
          <li>Keep track of your favorites easily</li>
        </ul>
      </div>
    `,
    width: 900,
    fontFamily: "RelaxAI-SoraRegular",
    style: {
      fontSize: "32px",
      lineHeight: "1.6",
      color: "#FFFFFF",
      textAlign: "left",
    },
    containerStyle: {
      // Optional: extra styling on the outer container
    },
  },
});
```

Later you can update the text:

```ts
await this.tag("content").setContent("New text to render!");
```

Or you can use the low level function:

```ts
import { renderParagraphToDataUrl } from "lightningjs-html-paragraph-image";

const dataUrl = await renderParagraphToDataUrl({
  text: "Hello LightningJS!",
  width: 600,
  fontFamily: "RelaxAI-SoraRegular",
  style: {
    fontSize: "32px",
    color: "#ffffff",
  },
});
```

---

## Types

```ts
type HtmlParagraphRenderOptions = {
  text?: string;
  html?: string;
  width?: number;               // default: 800
  fontFamily?: string;
  style?: Partial<CSSStyleDeclaration>;
  containerStyle?: Partial<CSSStyleDeclaration>;
  fontsStylesheetHref?: string; // default: "./static/fonts.css"
};

type HtmlContentInput =
  | string
  | (HtmlParagraphRenderOptions & { /* text/html/width... */ });
```

---

## How to publish this package to npm

1. **Unzip the project** somewhere on your machine.

2. Open a terminal in the project folder and install dependencies:

   ```bash
   npm install
   ```

3. Optionally, edit `package.json`:

   - Change `"name"` to the final npm name you want
     (for example `"@francbonet/lightning-html-paragraph-image"`).
   - Update `"author"`, `"repository"`, `"bugs"`, `"homepage"` if you want.

4. Build the library:

   ```bash
   npm run build
   ```

   This will compile TypeScript into `dist/` and generate `.d.ts` types.

5. Log in to npm (only once on your machine):

   ```bash
   npm login
   ```

6. Publish the package:

   ```bash
   npm publish --access public
   ```

   - If the name is scoped like `@francbonet/xxx`, you still need
     `--access public` for the first publish.
   - If npm says the name is already taken, change `"name"` in `package.json`
     and try again.

7. Use it in another LightningJS project:

   ```bash
   npm install your-package-name
   ```

   And then:

   ```ts
   import { HtmlParagraphImage } from "your-package-name";
   ```

---

## Example integration

There is an example file in `examples/WatchListExample.ts` that shows how
you could integrate `HtmlParagraphImage` into a watchlist page similar to the
one you showed (with an empty-state message rendered as an image).
