import "@paraboly/pwc-dynamic-form";
import {
  Component,
  Element,
  h,
  Method,
  Prop,
  State,
  Watch
} from "@stencil/core";
import { resolveJson } from "../../utils/utils";
import Enumerable from "linq";

@Component({
  tag: "pwc-filter",
  styleUrl: "pwc-filter.css",
  shadow: true
})
export class PwcFilterComponent {
  @Element() rootElement: HTMLPwcFilterElement;

  @State() data_resolved: object[];
  @Prop() data: string | object[];
  @Watch("data")
  dataWatchHandler(newValue) {
    this.data_resolved = resolveJson(newValue);
  }

  @State() mapping_resolved: { [key: string]: string };
  @Prop() mapping: string | { [key: string]: string };
  @Watch("mapping")
  mappingWatchHandler(newValue) {
    this.mapping_resolved = resolveJson(newValue);
  }

  componentWillLoad() {
    this.dataWatchHandler(this.data);
    this.mappingWatchHandler(this.mapping);
  }

  @Method() async filter(): Promise<object[]> {
    const dynamicForm = this.rootElement.querySelector(
      "pwc-dynamic-form"
    ) as HTMLPwcDynamicFormElement;

    let filtered_data = this.data_resolved;

    const formValues = await dynamicForm.getFieldValues(true);
    console.log("form values");
    console.log(formValues);

    for (const formElementName in formValues) {
      if (formValues.hasOwnProperty(formElementName)) {
        const formElementValue = formValues[formElementName];

        const new_filtered_data = this.filterFor(
          filtered_data,
          formElementName,
          formElementValue
        );

        console.log("filter step result:");
        console.log(new_filtered_data);

        filtered_data = new_filtered_data;
      }
    }

    return filtered_data;
  }

  filterFor(
    data_resolved: object[],
    formElementName: string,
    formElementValue: boolean | string | string[]
  ) {
    console.log(
      "filtering key: " + formElementName + " value: " + formElementValue
    );

    if (
      formElementValue === undefined ||
      formElementValue === null ||
      (typeof formElementValue !== "boolean" && formElementValue.length === 0)
    ) {
      return data_resolved;
    }

    const jsonFieldName = this.mapping_resolved[formElementName];

    if (
      typeof formElementValue === "string" ||
      typeof formElementValue === "boolean"
    ) {
      return Enumerable.from(data_resolved)
        .where(datum => datum[jsonFieldName] == formElementValue)
        .toArray();
    } else {
      return Enumerable.from(data_resolved)
        .where(datum =>
          Enumerable.from(formElementValue).any(
            formElementValueSingle =>
              formElementValueSingle == datum[jsonFieldName]
          )
        )
        .toArray();
    }
  }

  render() {
    console.log("data");
    console.log(this.data);

    console.log("mapping");
    console.log(this.mapping);

    return (
      <div>
        <slot />
      </div>
    );
  }
}
