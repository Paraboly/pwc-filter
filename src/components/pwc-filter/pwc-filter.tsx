import "@paraboly/pwc-dynamic-form";
import { FormChangedEventPayload } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form/DynamicFormEvents";
import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Listen,
  Method,
  Prop,
  State,
  Watch
} from "@stencil/core";
import Enumerable from "linq";
import { resolveJson } from "../../utils/utils";
import { PwcFilterInterfaces } from "./PwcFilterInterfaces";

@Component({
  tag: "pwc-filter",
  styleUrl: "pwc-filter.css",
  shadow: false
})
export class PwcFilterComponent {
  @Element() rootElement: HTMLPwcFilterElement;

  @State() resolvedData: object[];
  @Prop() data: string | object[];
  @Watch("data")
  dataWatchHandler(newDataValue: string | object[]) {
    this.resolvedData = resolveJson(newDataValue);
  }

  @State() resolvedMapping: { [key: string]: string };
  @Prop() mapping: string | { [key: string]: string };
  @Watch("mapping")
  mappingWatchHandler(newMappingValue: string | { [key: string]: string }) {
    this.resolvedMapping = resolveJson(newMappingValue);
  }

  @Event() filterChanged: EventEmitter<
    PwcFilterInterfaces.FilterChangedEventPayload
  >;

  @Listen("formChanged")
  async formChangedHandler(FormChangedEventPayload: FormChangedEventPayload) {
    const filterResult = await this.filter();
    this.filterChanged.emit({
      originalEvent: FormChangedEventPayload,
      filterResult: filterResult
    });
  }

  @Method() async filter(): Promise<object[]> {
    if (!this.resolvedMapping) {
      console.warn(
        "Mapping is not provided! All names will fall to default mapping."
      );
    }

    const dynamicForm = this.rootElement.querySelector(
      "pwc-dynamic-form"
    ) as HTMLPwcDynamicFormElement;

    let filteredData = this.resolvedData;

    const formValues = await dynamicForm.getFieldValues(true);

    for (const formElementName in formValues) {
      if (formValues.hasOwnProperty(formElementName)) {
        const formElementValue = formValues[formElementName];

        const newFilteredData = this.filterFor(
          filteredData,
          formElementName,
          formElementValue
        );

        filteredData = newFilteredData;
      }
    }

    return filteredData;
  }

  getMappedNameOrDefault(formElementName: string): string {
    return this.resolvedMapping &&
      this.resolvedMapping.hasOwnProperty(formElementName)
      ? this.resolvedMapping[formElementName]
      : formElementName;
  }

  filterFor(
    resolvedData: object[],
    formElementName: string,
    formElementValue: boolean | string | string[]
  ) {
    if (
      formElementValue === undefined ||
      formElementValue === null ||
      (typeof formElementValue !== "boolean" && formElementValue.length === 0)
    ) {
      return resolvedData;
    }

    const jsonFieldName = this.getMappedNameOrDefault(formElementName);

    if (
      typeof formElementValue === "string" ||
      typeof formElementValue === "boolean"
    ) {
      return Enumerable.from(resolvedData)
        .where(datum => datum[jsonFieldName] == formElementValue)
        .toArray();
    } else {
      return Enumerable.from(resolvedData)
        .where(datum =>
          Enumerable.from(formElementValue).any(
            formElementValueSingle =>
              formElementValueSingle == datum[jsonFieldName]
          )
        )
        .toArray();
    }
  }

  componentWillLoad() {
    this.dataWatchHandler(this.data);
    this.mappingWatchHandler(this.mapping);
  }

  render() {
    return (
      <div>
        <slot />
      </div>
    );
  }
}
