import "@paraboly/pwc-dynamic-form";
import "@paraboly/pwc-choices";
import "@paraboly/pwc-color-picker";
import { FormChangedEventPayload } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form/FormChangedEventPayload";
export interface FilterChangedEventPayload {
  originalEvent: FormChangedEventPayload;
  filterResult: object[];
}
