import "@paraboly/pwc-dynamic-form";
import "@paraboly/pwc-choices";
import { JSXBase } from "@stencil/core/dist/declarations";
import { FormChangedEventPayload } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form/FormChangedEventPayload";
import { PwcChoicesType } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-content/PwcChoicesType";

export namespace PwcFilterInterfaces {
  export interface FilterChangedEventPayload {
    originalEvent: FormChangedEventPayload;
    filterResult: object[];
  }

  export interface ItemConfig {
    dataField: string;
    type: string;
    label: string;
  }

  export interface NativeItemConfig
    extends ItemConfig,
      JSXBase.HTMLAttributes<HTMLInputElement> {}

  export type LabelProviderType = (value: string) => string;

  export interface PwcChoicesItemConfig
    extends ItemConfig,
      JSXBase.HTMLAttributes<HTMLPwcChoicesElement> {
    type: PwcChoicesType;
    labelProvider?: LabelProviderType;
  }

  export interface ColorPickerItemConfig
    extends ItemConfig,
      JSXBase.HTMLAttributes<HTMLColorPickerElement> {
    type: "color";
  }
}
