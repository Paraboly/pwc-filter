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

import {
  deepFilter,
  deepGet,
  resolveJson,
  moveItemToEnd
} from "../../utils/utils";
import { FilterChangedEventPayload } from "./FilterChangedEventPayload";
import { ItemConfig } from "./ItemConfig";
import { LabelProviderType } from "./LabelProviderType";
import { NativeItemConfig } from "./NativeItemConfig";
import { PwcChoicesItemConfig } from "./PwcChoicesItemConfig";
import { PwcColorPickerItemConfig } from "./PwcColorPickerItemConfig";
import { IconProviderType } from "./IconProviderType";
import { FormValuesType } from "@paraboly/pwc-dynamic-form/dist/types/components/pwc-dynamic-form/FormValuesType";

@Component({
  tag: "pwc-filter",
  styleUrl: "pwc-filter.css",
  shadow: false
})
export class PwcFilter {
  @Element() rootElement: HTMLPwcFilterElement;

  private mapping: { [key: string]: string } = {};
  private itemsAddedViaMethod: ItemConfig[] = [];

  public readonly nullValuePhrase = "pwc-filter___null" as const;
  public readonly undefinedValuePhrase = "pwc-filter___undefined" as const;
  public readonly nullOrUndefinedValuePhrase = "pwc-filter___nullOrUndefined" as const;

  private readonly defaultData = [];
  @State() resolvedData: object[];
  @Prop() data: string | object[];
  @Watch("data")
  dataWatchHandler(newDataValue: string | object[]) {
    if (newDataValue === null || newDataValue === undefined) {
      this.data = this.defaultData;
    } else {
      this.resolvedData = resolveJson(newDataValue);
    }
  }

  private readonly defaultItems = [];
  @State() resolvedItems: ItemConfig[];
  @Prop() items: string | ItemConfig[];
  @Watch("items")
  itemsWatchHandler(newItemsValue: string | ItemConfig[]) {
    if (newItemsValue === null || newItemsValue === undefined) {
      this.items = this.defaultItems;
    } else {
      this.resolvedItems = [
        ...resolveJson(newItemsValue),
        ...this.itemsAddedViaMethod
      ];
    }
  }

  private readonly defaultHandleNullAndUndefinedSeparately = false;
  /**
   * If this is true, the same string representation is assigned to null and undefined values for generated pwc-choices options.
   */
  @Prop() handleNullAndUndefinedSeparately: boolean = this
    .defaultHandleNullAndUndefinedSeparately;
  @Watch("handleNullAndUndefinedSeparately")
  handleNullAndUndefinedSeparatelyWatchHandler(newValue) {
    if (newValue === null || newValue === undefined) {
      this.handleNullAndUndefinedSeparately = this.defaultHandleNullAndUndefinedSeparately;
    }
  }

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
    if (config) {
      this.itemsAddedViaMethod = [...this.itemsAddedViaMethod, config];
      this.resolvedItems = [...this.resolvedItems, config];
      this.rootElement.forceUpdate();
    }
  }

  @Method()
  async removeItem(id: string) {
    const removedItemA = _.remove(this.itemsAddedViaMethod, { id });
    const removedItemB = _.remove(this.resolvedItems, { id });
    this.rootElement.forceUpdate();
    return removedItemA && removedItemA.length > 0
      ? removedItemA
      : removedItemB;
  }

  @Method() async filter(): Promise<object[]> {
    const dynamicForm = this.rootElement.querySelector(
      "pwc-dynamic-form"
    ) as HTMLPwcDynamicFormElement;

    let formValues: FormValuesType;

    try {
      formValues = await dynamicForm.getFieldValues();
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.error(
        "Exception while reading dynamic form field values.",
        "Returning the whole dataset without any filters.",
        e
      );
      return this.resolvedData;
    }

    if (formValues === null || formValues === undefined || formValues === {}) {
      // tslint:disable-next-line: no-console
      console.warn(
        "Dynamic form field values are empty.",
        "Returning the whole dataset without any filters."
      );
      return this.resolvedData;
    }

    let filteredData = this.resolvedData;

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
    this.handleNullAndUndefinedSeparatelyWatchHandler(
      this.handleNullAndUndefinedSeparately
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
    const itemClone = _.cloneDeep(item);
    delete itemClone.labelProvider;
    delete itemClone.dataField;

    const config = {
      name: this.generateElementName(item.dataField),
      options: this.generatePwcChoicesOptions(
        item.dataField,
        item.labelProvider,
        item.iconProvider
      ),
      ...itemClone
    };
    return config;
  }

  generatePwcColorPickerConfig(
    item: PwcColorPickerItemConfig
  ): PwcColorPickerConfig {
    const itemClone = _.cloneDeep(item);
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
    labelProvider: LabelProviderType,
    iconProvider: IconProviderType
  ): { value: string; label: string }[] {
    const values = _.uniq(
      deepGet(this.resolvedData, dataField).map(v =>
        this.generateValueStringForPwcChoicesOption(v)
      )
    );

    const moveToBottomArr = [
      this.nullValuePhrase,
      this.undefinedValuePhrase,
      this.nullOrUndefinedValuePhrase
    ];

    moveItemToEnd(values, v => moveToBottomArr.includes(v));

    const options = values.map(valStr => {
      return {
        value: valStr,
        label: labelProvider ? labelProvider(valStr) : valStr,
        icon: iconProvider ? iconProvider(valStr) : undefined
      };
    });

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
