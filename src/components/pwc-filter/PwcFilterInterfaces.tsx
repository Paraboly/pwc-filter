import "@paraboly/pwc-dynamic-form";
import { FormChangedEvent } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form/DynamicFormEvents";

export declare module PwcFilterInterfaces {
  export interface FilterChangedEventPayload {
    originalEvent: FormChangedEvent;
    filterResult: object[];
  }
}
