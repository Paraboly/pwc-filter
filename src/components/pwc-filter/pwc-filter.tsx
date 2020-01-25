import "@paraboly/pwc-dynamic-form";
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
import { FormChangedEventPayload } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form/FormChangedEventPayload";
import { ContentItemConfig } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-content/ContentItemConfig";
import { PwcChoicesConfig } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-content/PwcChoicesConfig";
import { ColorPickerConfig } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-content/ColorPickerConfig";
import { NativeInputConfig } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-content/NativeInputConfig";

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
  async formChangedHandler(formChangedEventPayload: FormChangedEventPayload) {
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

    const formValues = (await dynamicForm.getFieldValues("value")) as {
      [key: string]: string | boolean | string[];
    };

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
      (formElementValue instanceof Array && formElementValue.length === 0)
    ) {
      return resolvedData;
    }

    const jsonFieldName = this.getMappedNameOrDefault(formElementName);
    const vals = deepFilter(resolvedData, jsonFieldName, formElementValue);
    return vals;
  }

  componentWillLoad() {
    this.dataWatchHandler(this.data);
    this.itemsWatchHandler(this.items);
  }

  generateDynamicForm(): HTMLPwcDynamicFormElement {
    return (
      <pwc-dynamic-form>
        {this.resolvedItems && this.generateDynamicFormContent()}
      </pwc-dynamic-form>
    );
  }

  generateDynamicFormContent(): HTMLPwcDynamicFormContentElement {
    const formElementConfigs: ContentItemConfig[] = [];
    const mapping: { [key: string]: string } = {};

    for (const item of this.resolvedItems) {
      let config: ContentItemConfig;

      switch (item.type) {
        case "select-multi":
        case "select-single":
          config = this.generatePwcChoicesConfig(
            item as PwcFilterInterfaces.PwcChoicesItemConfig
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

  generatePwcChoicesConfig(
    item: PwcFilterInterfaces.PwcChoicesItemConfig
  ): PwcChoicesConfig {
    const itemClone = { ...item };
    delete itemClone.labelProvider;
    delete itemClone.dataField;

    const config = {
      name: this.generateElementName(item.dataField),
      options: this.generatePwcChoicesOptions(
        item.dataField,
        item.labelProvider
      ),
      ...itemClone
    };
    return config;
  }

  generateColorPickerConfig(
    item: PwcFilterInterfaces.ColorPickerItemConfig
  ): ColorPickerConfig {
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
  ): NativeInputConfig {
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

  generatePwcChoicesOptions(
    dataField: string,
    labelProvider: PwcFilterInterfaces.LabelProviderType
  ): { value: string; label: string }[] {
    const options = deepGet(this.resolvedData, dataField).map(val => {
      const valStr: string = val.toString();
      return {
        value: valStr,
        label: labelProvider ? labelProvider(valStr) : valStr
      };
    });
    return options;
  }

  render() {
    return <div>{this.generateDynamicForm()}</div>;
  }
}
