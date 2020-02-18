import "@paraboly/pwc-dynamic-form";

import { ContentItemConfig } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-field/ContentItemConfig";
import { NativeInputConfig } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-field/NativeInputConfig";
import { PwcChoicesConfig } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-field/PwcChoicesConfig";
import { PwcColorPickerConfig } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form-field/PwcColorPickerConfig";
import { FormChangedEventPayload } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form/FormChangedEventPayload";
import {
  h,
  Component,
  Element,
  Event,
  EventEmitter,
  Listen,
  Method,
  Prop,
  State,
  Watch
} from "@stencil/core";
import _ from "lodash";

import { deepFilter, deepGet, resolveJson } from "../../utils/utils";
import { FilterChangedEventPayload } from "./FilterChangedEventPayload";
import { ItemConfig } from "./ItemConfig";
import { LabelProviderType } from "./LabelProviderType";
import { NativeItemConfig } from "./NativeItemConfig";
import { PwcChoicesItemConfig } from "./PwcChoicesItemConfig";
import { PwcColorPickerItemConfig } from "./PwcColorPickerItemConfig";

@Component({
  tag: "pwc-filter",
  styleUrl: "pwc-filter.css",
  shadow: false
})
export class PwcFilter {
  @Element() rootElement: HTMLPwcFilterElement;

  private mapping: { [key: string]: string };
  private itemsAddedViaMethod: ItemConfig[] = [];

  public readonly nullValuePhrase = "pwc-filter___null" as const;
  public readonly undefinedValuePhrase = "pwc-filter___undefined" as const;
  public readonly nullOrUndefinedValuePhrase = "pwc-filter___nullOrUndefined" as const;

  @State() resolvedData: object[];
  @Prop() data: string | object[];
  @Watch("data")
  dataWatchHandler(newDataValue: string | object[]) {
    this.resolvedData = resolveJson(newDataValue);
  }

  @State() resolvedItems: ItemConfig[];
  @Prop() items: string | ItemConfig[];
  @Watch("items")
  itemsWatchHandler(newItemsValue: string | ItemConfig[]) {
    this.resolvedItems = resolveJson(newItemsValue);
    this.resolvedItems = [...this.resolvedItems, ...this.itemsAddedViaMethod];
  }

  /**
   * If this is true, the same string representation is assigned to null and undefined values for generated pwc-choices options.
   */
  @Prop() handleNullAndUndefinedSeparately: boolean = false;

  @Event() filterChanged: EventEmitter<FilterChangedEventPayload>;

  @Listen("formChanged")
  async formChangedHandler(formChangedEventPayload: FormChangedEventPayload) {
    const filterResult = await this.filter();
    this.filterChanged.emit({
      originalEvent: formChangedEventPayload,
      filterResult
    });
  }

  @Method()
  async addItem(config: ItemConfig) {
    this.itemsAddedViaMethod = [...this.itemsAddedViaMethod, config];
    this.resolvedItems = [...this.resolvedItems, config];
    this.rootElement.forceUpdate();
  }

  @Method()
  async removeItem(id: string) {
    _.remove(this.itemsAddedViaMethod, { id });
    _.remove(this.resolvedItems, { id });
    this.rootElement.forceUpdate();
  }

  @Method() async filter(): Promise<object[]> {
    const dynamicForm = this.rootElement.querySelector(
      "pwc-dynamic-form"
    ) as HTMLPwcDynamicFormElement;

    let filteredData = this.resolvedData;

    const formValues = await dynamicForm.getFieldValues();

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

    if (formElementValue instanceof Array) {
      if (formElementValue.some(a => a === this.nullValuePhrase)) {
        _.remove(formElementValue, this.nullValuePhrase);
        formElementValue.push(null);
      }

      if (formElementValue.some(a => a === this.undefinedValuePhrase)) {
        _.remove(formElementValue, this.undefinedValuePhrase);
        formElementValue.push(undefined);
      }

      if (formElementValue.some(a => a === this.nullOrUndefinedValuePhrase)) {
        _.remove(formElementValue, this.nullOrUndefinedValuePhrase);
        formElementValue.push(null);
        formElementValue.push(undefined);
      }
    }

    const jsonFieldName = this.getMappedNameOrDefault(formElementName);
    const vals = deepFilter(resolvedData, jsonFieldName, formElementValue);
    return vals;
  }

  componentWillLoad() {
    this.dataWatchHandler(this.data);
    this.itemsWatchHandler(this.items);
  }

  generateDynamicFormContent(): HTMLPwcDynamicFormContentElement {
    const formElementConfigs: ContentItemConfig[] = [];
    const mapping: { [key: string]: string } = {};

    for (const item of this.resolvedItems) {
      let config: ContentItemConfig;

      switch (item.type) {
        case "select-multi":
        case "select-single":
          config = this.generatePwcChoicesConfig(item as PwcChoicesItemConfig);
          break;

        case "color":
          config = this.generatePwcColorPickerConfig(
            item as PwcColorPickerItemConfig
          );
          break;

        default:
          config = this.generateNativeInputConfig(item as NativeItemConfig);
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

  generatePwcChoicesConfig(item: PwcChoicesItemConfig): PwcChoicesConfig {
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

  generatePwcColorPickerConfig(
    item: PwcColorPickerItemConfig
  ): PwcColorPickerConfig {
    const itemClone = { ...item };
    delete itemClone.dataField;

    const config = {
      name: this.generateElementName(item.dataField),
      ...itemClone
    };
    return config;
  }

  generateNativeInputConfig(item: NativeItemConfig): NativeInputConfig {
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

  generateValueStringForPwcChoicesOption(val) {
    if (this.handleNullAndUndefinedSeparately) {
      return val === null
        ? this.nullValuePhrase
        : val === undefined
        ? this.undefinedValuePhrase
        : val.toString();
    } else {
      return val === null || val === undefined
        ? this.nullOrUndefinedValuePhrase
        : val.toString();
    }
  }

  generatePwcChoicesOptions(
    dataField: string,
    labelProvider: LabelProviderType
  ): { value: string; label: string }[] {
    const options = _.uniq(deepGet(this.resolvedData, dataField)).map(val => {
      const valStr: string = this.generateValueStringForPwcChoicesOption(val);
      return {
        value: valStr,
        label: labelProvider ? labelProvider(valStr) : valStr
      };
    });

    if (this.handleNullAndUndefinedSeparately) {
      _.remove(
        options,
        o =>
          o.value === this.nullValuePhrase ||
          o.value === this.undefinedValuePhrase
      );
      options.push({
        value: this.nullValuePhrase,
        label: labelProvider
          ? labelProvider(this.nullValuePhrase)
          : this.nullValuePhrase
      });
      options.push({
        value: this.undefinedValuePhrase,
        label: labelProvider
          ? labelProvider(this.undefinedValuePhrase)
          : this.undefinedValuePhrase
      });
    }

    if (!this.handleNullAndUndefinedSeparately) {
      _.remove(options, { value: this.nullOrUndefinedValuePhrase });
      options.push({
        value: this.nullOrUndefinedValuePhrase,
        label: labelProvider
          ? labelProvider(this.nullOrUndefinedValuePhrase)
          : this.nullOrUndefinedValuePhrase
      });
    }

    return options;
  }

  render() {
    return (
      <pwc-dynamic-form>
        {this.resolvedItems && this.generateDynamicFormContent()}
      </pwc-dynamic-form>
    );
  }
}
