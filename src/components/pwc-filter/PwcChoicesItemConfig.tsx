import "@paraboly/pwc-dynamic-form";
import "@paraboly/pwc-choices";
import "@paraboly/pwc-color-picker";
import { JSXBase } from "@stencil/core/dist/declarations";
import { ItemConfig } from "./ItemConfig";
import { LabelProviderType } from "./LabelProviderType";
import { PwcChoicesType } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-field/PwcChoicesType";
import { IconProviderType } from "./IconProviderType";
export interface PwcChoicesItemConfig
  extends ItemConfig,
    JSXBase.HTMLAttributes<HTMLPwcChoicesElement> {
  type: PwcChoicesType;
  labelProvider?: LabelProviderType;
  iconProvider?: IconProviderType;
  ref?: (elm?: HTMLPwcChoicesElement) => void;
}
