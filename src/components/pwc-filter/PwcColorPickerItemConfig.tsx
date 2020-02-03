import "@paraboly/pwc-dynamic-form";
import "@paraboly/pwc-choices";
import { JSXBase } from "@stencil/core/dist/declarations";
import { ItemConfig } from "./ItemConfig";
export interface PwcColorPickerItemConfig
  extends ItemConfig,
    JSXBase.HTMLAttributes<HTMLPwcColorPickerElement> {
  type: "color";
}
