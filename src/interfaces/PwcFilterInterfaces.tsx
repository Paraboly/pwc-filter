import "@paraboly/pwc-dynamic-form";
import { JSXBase } from "@stencil/core/dist/declarations";
import { PwcDynamicFormInterfaces } from "@paraboly/pwc-dynamic-form/dist/types/interfaces/PwcDynamicFormInterfaces";

export namespace PwcFilterInterfaces {
  export interface FilterChangedEventPayload {
    originalEvent: PwcDynamicFormInterfaces.FormChangedEventPayload;
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

  export interface PwcSelectItemConfig
    extends ItemConfig,
      JSXBase.HTMLAttributes<HTMLPwcChoicesElement> {
    type: PwcDynamicFormInterfaces.PwcChoicesType;
    labelProvider?: (value: string) => string;
  }

  export interface ColorPickerItemConfig
    extends ItemConfig,
      JSXBase.HTMLAttributes<HTMLColorPickerElement> {
    type: "color";
  }
}
