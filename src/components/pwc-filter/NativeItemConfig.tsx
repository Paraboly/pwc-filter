import "@paraboly/pwc-dynamic-form";
import "@paraboly/pwc-choices";
import { JSXBase } from "@stencil/core/dist/declarations";
import { ItemConfig } from "./ItemConfig";
export interface NativeItemConfig
  extends ItemConfig,
    JSXBase.HTMLAttributes<HTMLInputElement> {}
