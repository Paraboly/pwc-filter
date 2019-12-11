import "@paraboly/pwc-dynamic-form";
import { PwcDynamicForm } from "@paraboly/pwc-dynamic-form/dist/types/utils/PwcDynamicForm";

export namespace PwcFilter {
  // @TODO: This should be in pwc-choices, not here.
  export type PwcSelectType =
    | "select-single"
    | "select-multiple"
    | "select-text";

  // @TODO: This should be in pwc-choices, not here.
  export type PwcChoicesDistinctMode = "value" | "label" | "all" | "none";

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
    distinct?: PwcChoicesDistinctMode;
  }

  export interface ColorPickerItemConfig extends ItemConfig {}
}
