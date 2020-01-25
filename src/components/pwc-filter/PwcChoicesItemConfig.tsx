import "@paraboly/pwc-dynamic-form";
import "@paraboly/pwc-choices";
import { JSXBase } from "@stencil/core/dist/declarations";
import { PwcChoicesType } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-content/PwcChoicesType";
import { ItemConfig } from "./ItemConfig";
import { LabelProviderType } from "./LabelProviderType";
export interface PwcChoicesItemConfig
  extends ItemConfig,
    JSXBase.HTMLAttributes<HTMLPwcChoicesElement> {
  type: PwcChoicesType;
  labelProvider?: LabelProviderType;
}
