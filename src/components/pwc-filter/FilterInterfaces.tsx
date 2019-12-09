import "@paraboly/pwc-dynamic-form";
import { FormChangedEventPayload } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form/FormEvents";

export interface FilterChangedEventPayload {
  originalEvent: FormChangedEventPayload;
  filterResult: object[];
}
