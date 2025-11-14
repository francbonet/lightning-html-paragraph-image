// src/types/lightning-sdk.d.ts

declare module "@lightningjs/sdk" {
  export namespace Lightning {
    class Component {
      // propiedades básicas que usa tu lib:
      w: number;
      h: number;
      texture: any;
      stage: any;

      static _template(...args: any[]): any;
      patch(obj: any): void;
      tag(name: string): any;
    }

    namespace textures {
      class ImageTexture {}
    }
  }
}
