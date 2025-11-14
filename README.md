# lightningjs-html-paragraph-image

Small helper library for **LightningJS 2** that lets you render HTML/text
paragraphs to a bitmap using `html2canvas`, and then use that bitmap as an
`ImageTexture` inside a Lightning component.

It provides two main APIs:

- `renderParagraphToDataUrl(opts)` – a low-level function that returns a PNG data URL.
- `HtmlParagraphImage` – a `Lightning.Component` that wraps the above, renders HTML/text into a bitmap, and automatically sets its own texture/size.

> ⚠️ This library is meant to be used **in the browser** (inside a LightningJS app).  
> It relies on `document` and `html2canvas`.

---

## Installation

```bash
npm install lightningjs-html-paragraph-image html2canvas
# or
yarn add lightningjs-html-paragraph-image html2canvas
```

Your project must also include `@lightningjs/sdk` (declared as a peer dependency).

---

## Basic Usage

### Option A — Using `childList.a()`

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
  },
});
```

### Option B — Using the Component via Template

```ts
static override _template() {
  return {
    Content: {
      type: HtmlParagraphImage,
      x: 0,
      y: 40,
      w: 1920,
      visible: true,
    },
  };
}
```

Then update it like this:

```ts
const content = this.tag("Content");

await content.setContent({
  html: "<p>Your watchlist is empty 😢</p>",
  width: 1920,
  fontFamily: "RelaxAI-SoraMedium",
  style: {
    fontSize: "40px",
    lineHeight: "1.6",
    color: "#FFFFFF",
  },
});
```

---

## Low-Level Usage (no Lightning component)

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

You may use `dataUrl` in any `ImageTexture`.

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
  | (HtmlParagraphRenderOptions & {});
```

---

# How to Register Custom Fonts (fonts.css)

This library uses an internal loader function called `ensureFontsStylesheet()`:

```ts
export function ensureFontsStylesheet(href = "./static/fonts.css"): Promise<void>
```

This means you **must create a `fonts.css` file inside the `static/` folder** of your LightningJS project containing all the fonts you want to use.

LightningJS **does not automatically load fonts**, so if this file is missing, html2canvas will fall back to default system fonts and your rendered text will not match your design.

---

## 📁 Recommended Project Structure

```
your-lightning-app/
  static/
    fonts.css
    fonts/
      Sora-Bold.ttf
      Sora-Regular.ttf
      Sora-Medium.ttf
      Sora-SemiBold.ttf
```

---

## ✨ Example `static/fonts.css`

```css
@font-face {
  font-family: "RelaxAI-SoraBold";
  src: url("./fonts/Sora-Bold.ttf") format("truetype");
  font-weight: 700;
  font-display: swap;
}

@font-face {
  font-family: "RelaxAI-SoraRegular";
  src: url("./fonts/Sora-Regular.ttf") format("truetype");
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: "RelaxAI-SoraMedium";
  src: url("./fonts/Sora-Medium.ttf") format("truetype");
  font-weight: 500;
  font-display: swap;
}

@font-face {
  font-family: "RelaxAI-SoraSemiBold";
  src: url("./fonts/Sora-SemiBold.ttf") format("truetype");
  font-weight: 600;
  font-display: swap;
}
```

---

## 🧩 How the Library Uses These Fonts

When you call:

```ts
await renderParagraphToDataUrl({
  html: "<p>Hello Lightning!</p>",
  fontFamily: "RelaxAI-SoraRegular",
  width: 900,
});
```

The library internally executes:

```ts
ensureFontsStylesheet("./static/fonts.css");
```

This:

1. Injects a `<link rel="stylesheet">` into the `<head>`.
2. Waits for the stylesheet to finish loading.
3. Ensures the fonts are available before rendering.
4. Loads only once per application.

---

## 🔍 Using a Custom Stylesheet Path

If your `fonts.css` lives somewhere else:

```ts
await renderParagraphToDataUrl({
  html: "...",
  fontFamily: "RelaxAI-SoraMedium",
  fontsStylesheetHref: "/assets/styles/fonts.css",
});
```

---

## 🎯 Result

Once your fonts are correctly registered:

- `content: { fontFamily: "RelaxAI-SoraRegular" }`
- `style: { fontFamily: "RelaxAI-SoraBold" }`
- `<p style="font-family: RelaxAI-SoraMedium">…</p>`

will all render **exactly with your custom fonts**, both inside html2canvas and in the final LightningJS `ImageTexture`.

