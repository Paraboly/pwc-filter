import {
  Component,
  h,
  Method,
  Prop,
  State,
  Watch,
  Element
} from "@stencil/core";
import { resolveJson } from "../../utils/utils";
import "@paraboly/pwc-dynamic-form";

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

  componentWillLoad() {
    this.dataWatchHandler(this.data);
  }

  componentDidLoad() {
    this.hookToDynamicForm();
  }

  @Method() filter() {
    throw new Error("Method not implemented.");
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

  hookToDynamicForm() {
    const form = this.rootElement.querySelector(
      "pwc-dynamic-form"
    ) as HTMLPwcDynamicFormElement;
  }
}
