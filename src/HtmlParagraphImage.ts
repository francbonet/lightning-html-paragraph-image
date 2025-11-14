// LightningJS component that uses htmlTextRenderer to create an ImageTexture
// from an HTML paragraph.
import { Lightning } from "@lightningjs/sdk";
import { renderParagraphToDataUrl, HtmlParagraphRenderOptions } from "./htmlTextRenderer";

export type HtmlContentInput =
  | string
  | (HtmlParagraphRenderOptions & {
      /**
       * For convenience, you can pass `text` or `html` directly here.
       * Width defaults to 800px if omitted.
       */
    });

/**
 * HtmlParagraphImage
 *
 * Small helper component that turns an HTML paragraph into an ImageTexture so
 * you can use it like any other image inside your LightningJS app.
 *
 * Usage:
 *
 *   import { HtmlParagraphImage } from "lightningjs-html-paragraph-image";
 *
 *   this.tag("EmptyMessage").childList.a({
 *     type: HtmlParagraphImage,
 *     x: 100,
 *     y: 200,
 *     content: {
 *       html: "<p>Your watchlist is empty 😢</p>",
 *       width: 900,
 *       fontFamily: "RelaxAI-SoraRegular",
 *       style: {
 *         fontSize: "32px",
 *         lineHeight: "1.4",
 *         color: "#FFFFFF",
 *       },
 *     },
 *   });
 *
 *   // Later:
 *   await this.tag("EmptyMessage").setContent("New text!");
 */
export class HtmlParagraphImage extends Lightning.Component {
  private _content: HtmlContentInput | null = null;
  private _loading = false;

  static override _template(): Lightning.Component.Template {
    return {
      texture: undefined,
    };
  }

  /**
   * Convenience setter compatible with patch({ content })
   */
  set content(value: HtmlContentInput | null) {
    if (value === this._content) return;
    this._content = value;
    // Fire and forget, caller can also await setContent()
    void this.setContent(value);
  }

  get content(): HtmlContentInput | null {
    return this._content;
  }

  /**
   * Explicit async API so the caller can await until the texture is ready.
   */
  async setContent(content: HtmlContentInput | null): Promise<void> {
    this._content = content;

    if (!content) {
      this.texture = undefined as any;
      this.w = 0;
      this.h = 0;
      return;
    }

    // Normalize input
    const opts: HtmlParagraphRenderOptions =
      typeof content === "string"
        ? { text: content }
        : { ...content };

    if (!opts.width) {
      opts.width = 800;
    }

    this._loading = true;

    try {
      const src = await renderParagraphToDataUrl(opts);

      const texture = this.stage.texture({
        type: Lightning.textures.ImageTexture,
        src,
      } as any);

      await (texture as any).load();

      this.texture = texture as any;

      const source = (texture as any).source;
      if (source) {
        this.w = source.w;
        this.h = source.h;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[HtmlParagraphImage] Error loading texture", e);
    } finally {
      this._loading = false;
    }
  }
}
