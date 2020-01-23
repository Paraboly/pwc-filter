import "@paraboly/pwc-dynamic-form";
import { PwcDynamicFormInterfaces } from "@paraboly/pwc-dynamic-form/dist/types/interfaces/PwcDynamicFormInterfaces";
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
import {
  deepFilter,
  deepGet,
  isCompoundKey,
  resolveJson
} from "../../utils/utils";
import { PwcFilterInterfaces } from "../../interfaces/PwcFilterInterfaces";

@Component({
  tag: "pwc-filter",
  styleUrl: "pwc-filter.css",
  shadow: false
})
export class PwcFilter {
  @Element() rootElement: HTMLPwcFilterElement;

  private mapping: { [key: string]: string };

  @State() resolvedData: object[];
  @Prop() data: string | object[];
  @Watch("data")
  dataWatchHandler(newDataValue: string | object[]) {
    this.resolvedData = resolveJson(newDataValue);
  }

  @State() resolvedItems: PwcFilterInterfaces.ItemConfig[];
  @Prop() items: string | PwcFilterInterfaces.ItemConfig[];
  @Watch("items")
  itemsWatchHandler(newItemsValue: string | PwcFilterInterfaces.ItemConfig[]) {
    this.resolvedItems = resolveJson(newItemsValue);
  }

  @Event() filterChanged: EventEmitter<
    PwcFilterInterfaces.FilterChangedEventPayload
  >;

  @Listen("formChanged")
  async formChangedHandler(
    formChangedEventPayload: PwcDynamicFormInterfaces.FormChangedEventPayload
  ) {
    const filterResult = await this.filter();
    this.filterChanged.emit({
      originalEvent: formChangedEventPayload,
      filterResult
    });
  }

  @Method() async filter(): Promise<object[]> {
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
    return this.mapping && this.mapping.hasOwnProperty(formElementName)
      ? this.mapping[formElementName]
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

    if (isCompoundKey(jsonFieldName)) {
      const vals = deepFilter(this.data, jsonFieldName, formElementValue);
      return vals;
    } else {
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
  }

  componentWillLoad() {
    this.dataWatchHandler(this.data);
    this.itemsWatchHandler(this.items);
  }

  render() {
    return <div>{this.generateDynamicForm()}</div>;
  }

  generateDynamicForm(): HTMLPwcDynamicFormElement {
    return (
      <pwc-dynamic-form>
        {this.resolvedItems && this.generateDynamicFormContent()}
      </pwc-dynamic-form>
    );
  }

  generateDynamicFormContent(): HTMLPwcDynamicFormContentElement {
    const formElementConfigs: PwcDynamicFormInterfaces.ContentItemConfig[] = [];
    const mapping: { [key: string]: string } = {};

    for (const item of this.resolvedItems) {
      let config;

      switch (item.type) {
        case "select-multiple":
        case "select-single":
        case "select-text":
          config = this.generatePwcSelectConfig(
            item as PwcFilterInterfaces.PwcSelectItemConfig
          );
          break;

        case "color":
          config = this.generateColorPickerConfig(
            item as PwcFilterInterfaces.ColorPickerItemConfig
          );
          break;

        default:
          config = this.generateNativeInputConfig(
            item as PwcFilterInterfaces.NativeItemConfig
          );
          break;
      }

      formElementConfigs.push(config);
      mapping[config.name] = item.dataField;
    }

    this.mapping = mapping;

    return (
      <pwc-dynamic-form-content
        items={formElementConfigs}
      ></pwc-dynamic-form-content>
    );
  }

  generatePwcSelectConfig(
    item: PwcFilterInterfaces.PwcSelectItemConfig
  ): PwcDynamicFormInterfaces.PwcChoicesConfig {
    const itemClone = { ...item };
    delete itemClone.labelProvider;
    delete itemClone.dataField;

    const config = {
      name: this.generateElementName(item.dataField),
      choices: this.generatePwcChoices(item.dataField, item.labelProvider),
      ...itemClone
    };
    return config;
  }

  generateColorPickerConfig(
    item: PwcFilterInterfaces.ColorPickerItemConfig
  ): PwcDynamicFormInterfaces.ColorPickerConfig {
    const itemClone = { ...item };
    delete itemClone.dataField;

    const config = {
      name: this.generateElementName(item.dataField),
      ...itemClone
    };
    return config;
  }

  generateNativeInputConfig(
    item: PwcFilterInterfaces.NativeItemConfig
  ): PwcDynamicFormInterfaces.NativeInputConfig {
    const itemClone = { ...item };
    delete itemClone.dataField;

    const config = {
      name: this.generateElementName(item.dataField),
      ...itemClone
    };
    return config;
  }

  generateElementName(dataFieldName: string): string {
    return dataFieldName.replace(".", "_") + "_elem";
  }

  generatePwcChoices(dataField: string, labelProvider): any[] {
    const choices = deepGet(this.resolvedData, dataField).map(val => {
      const valStr = val.toString();
      return {
        value: valStr,
        label: labelProvider ? labelProvider(valStr) : valStr
      };
    });
    return choices;
  }
}
