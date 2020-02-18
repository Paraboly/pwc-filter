import "@paraboly/pwc-dynamic-form";
import "@paraboly/pwc-choices";
import "@paraboly/pwc-color-picker";
import { JSXBase } from "@stencil/core/dist/declarations/jsx";
export interface ItemConfig extends JSXBase.HTMLAttributes<HTMLElement> {
  dataField: string;
  type: string;
  label: string;
}
