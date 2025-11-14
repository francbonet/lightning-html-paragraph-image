import html2canvas from "html2canvas";

export type HtmlParagraphRenderOptions = {
  /**
   * Plain text to render. If `html` is also provided, `html` wins.
   */
  text?: string;
  /**
   * Raw HTML string to render inside the paragraph container.
   */
  html?: string;
  /**
   * Width in CSS pixels used to layout the paragraph.
   * Defaults to 800.
   */
  width?: number;
  /**
   * Optional font family applied to the paragraph element.
   */
  fontFamily?: string;
  /**
   * Extra inline styles applied directly to the paragraph element.
   */
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Extra inline styles applied to the outer container that html2canvas renders.
   */
  containerStyle?: Partial<CSSStyleDeclaration>;
  /**
   * Optional href to a CSS file that registers your custom fonts.
   * Defaults to "./static/fonts.css". Ignored if falsy.
   */
  fontsStylesheetHref?: string;
};

let fontsCssPromise: Promise<void> | null = null;

/**
 * Ensures we only add the fonts stylesheet once.
 */
export function ensureFontsStylesheet(href = "./static/fonts.css"): Promise<void> {
  if (!href) return Promise.resolve();

  if (fontsCssPromise) return fontsCssPromise;

  if (typeof document === "undefined") {
    // Server side: nothing to do.
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLLinkElement>(
    `link[data-lightning-html-fonts="true"][href="${href}"]`,
  );
  if (existing) {
    fontsCssPromise = Promise.resolve();
    return fontsCssPromise;
  }

  fontsCssPromise = new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.lightningHtmlFonts = "true";

    link.onload = () => resolve();
    link.onerror = () => {
      console.warn("[htmlTextRenderer] Failed to load fonts stylesheet:", href);
      resolve(); // we still resolve: text will render with fallback fonts
    };

    document.head.appendChild(link);
  });

  return fontsCssPromise;
}

function createParagraphContainer(opts: HtmlParagraphRenderOptions): HTMLDivElement {
  const {
    width = 800,
    text,
    html,
    fontFamily,
    style,
    containerStyle,
  } = opts;

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.pointerEvents = "none";
  container.style.width = `${width}px`;
  container.style.display = "inline-block";
  container.style.backgroundColor = "transparent";

  if (containerStyle) {
    Object.assign(container.style, containerStyle);
  }

  const para = document.createElement("div");
  para.style.display = "inline-block";
  para.style.whiteSpace = "normal";
  para.style.wordWrap = "break-word";

  if (fontFamily) {
    para.style.fontFamily = fontFamily;
  }
  if (style) {
    Object.assign(para.style, style);
  }

  if (html) {
    para.innerHTML = html;
  } else if (typeof text === "string") {
    para.textContent = text;
  } else {
    para.textContent = "";
  }

  container.appendChild(para);
  return container;
}

/**
 * Renders a block of HTML/text to a PNG data URL using html2canvas.
 * This function must run in a browser environment (it uses `document`).
 */
export async function renderParagraphToDataUrl(
  opts: HtmlParagraphRenderOptions,
): Promise<string> {
  if (typeof document === "undefined") {
    throw new Error(
      "[htmlTextRenderer] renderParagraphToDataUrl must be called in a browser environment",
    );
  }

  if (!opts.text && !opts.html) {
    throw new Error(
      "[htmlTextRenderer] You must provide either `text` or `html`",
    );
  }

  // Make sure fonts are ready (if configured)
  if (opts.fontsStylesheetHref) {
    await ensureFontsStylesheet(opts.fontsStylesheetHref);
  } else {
    await ensureFontsStylesheet();
  }

  const container = createParagraphContainer(opts);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: "transparent",
      scale: 1,
      useCORS: true,
    });

    document.body.removeChild(container);

    return canvas.toDataURL("image/png");
  } catch (err) {
    document.body.removeChild(container);
    throw err;
  }
}
