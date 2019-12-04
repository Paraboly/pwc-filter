import "@paraboly/pwc-dynamic-form";

import Enumerable from "linq";

import {
  Component,
  Element,
  h,
  Method,
  Prop,
  State,
  Watch
} from "@stencil/core";

import { stringToAnyDict, stringToStringDict } from "../../utils/type-aliases";
import { resolveJson } from "../../utils/utils";

@Component({
  tag: "pwc-filter",
  styleUrl: "pwc-filter.css",
  shadow: true
})
export class PwcFilterComponent {
  @Element() rootElement: HTMLPwcFilterElement;

  @State() data_resolved: stringToAnyDict[];
  @State() mapping_resolved: stringToStringDict[];
  @State() form: HTMLPwcDynamicFormElement;

  @Prop() data: string | stringToAnyDict[];
  @Prop() mapping: string | stringToStringDict[];

  @Watch("data")
  dataWatchHandler(newValue: string | stringToAnyDict[]) {
    this.data_resolved = resolveJson(newValue);
  }

  @Watch("mapping")
  mappingWatchHandler(newValue: string | stringToStringDict[]) {
    this.mapping_resolved = resolveJson(newValue);
  }

  componentWillLoad() {
    this.dataWatchHandler(this.data);
    this.mappingWatchHandler(this.mapping);
  }

  componentDidLoad() {
    this.hookToDynamicForm();
  }

  @Method() async getFilteredData(): Promise<stringToAnyDict[]> {
    const data = Enumerable.from(this.data_resolved);
    let valid_data = [];

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const val = data[key];
        const isValid = await this.applyFilter(val);
        if (isValid) {
          valid_data = [...valid_data, val];
        }
      }
    }

    return valid_data;
  }

  async applyFilter(datum: stringToAnyDict): Promise<boolean> {
    const formValues = await this.form.getFieldValues();
    return Enumerable.from(this.mapping_resolved).all(mapping => {
      const fieldLocation = mapping.key;
      const elementName = mapping.value;

      const jsonFieldValue = this.getJsonFieldValue(datum, fieldLocation);
      const formElementValue = formValues[elementName];

      if (formElementValue instanceof Array) {
        return (
          Enumerable.from(jsonFieldValue)
            .intersect(formElementValue)
            .count() > 0
        );
      } else {
        return Enumerable.from(jsonFieldValue).contains(formElementValue);
      }
    });
  }

  getJsonFieldValue(datum: stringToAnyDict, fieldLocation: string): any[] {
    const steps = fieldLocation.split(".");

    let currentLocation = Enumerable.from(datum);

    steps.forEach(step => {
      currentLocation = currentLocation.select(locEl => locEl[step]);
    });

    return currentLocation.toArray();
  }

  hookToDynamicForm() {
    this.form = this.rootElement.querySelector(
      "pwc-dynamic-form"
    ) as HTMLPwcDynamicFormElement;

    this.fillDynamicForm(this.data_resolved, this.mapping_resolved);
  }

  fillDynamicForm(data: stringToAnyDict[], mappings: stringToStringDict[]) {
    mappings.forEach(mapping => {
      const fieldPath = mapping.key;
      const elementName = mapping.name;

      const fieldValues = Enumerable.from(data).select(datum =>
        this.getJsonFieldValue(datum, fieldPath)
      );
    });
  }

  render() {
    console.log("data");
    console.log(this.data);
    return (
      <div>
        <slot />
      </div>
    );
  }
}
