import "@paraboly/pwc-dynamic-form";
import { PwcDynamicForm } from "@paraboly/pwc-dynamic-form/dist/types/utils/PwcDynamicForm";

export namespace PwcFilter {
  export type PwcSelectType =
    | "select-single"
    | "select-multiple"
    | "select-text";

  export interface FilterChangedEventPayload {
    originalEvent: PwcDynamicForm.FormChangedEventPayload;
    filterResult: object[];
  }

  export interface ItemConfig {
    dataField: string;
    type: string;
    label: string;
  }

  export interface PwcSelectItemConfig extends ItemConfig {
    type: PwcSelectType;
  }

  export interface ColorPickerItemConfig extends ItemConfig {}
}
