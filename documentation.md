# Structure

```html
<pwc-filter></pwc-filter>
```

# `pwc-filter`

## Render structure

```html
<div>
  Generated pwc-dynamic-form
</div>
```

## `data` Prop

`data: string | object[]`

This is where you feed in the data to be filtered. It will remain immutable (i.e. we will not modify it).

## `items` Prop

`items: string | PwcFilter.ItemConfig[]`

This where you instruct the filter how to filter the data.

Options of `<pwc-choices>` elements will be filled-in automatically using the values from the data.

### `PwcFilter.ItemConfig` Interface

```ts
dataField: string;
type: string;
label: string;
```

- `dataField`: This is the data field this form element is tasked to filter.
- `type`: The type of the form element.
- `label`: The label for the form element.

#### Deep data field filtering

We support `dataField` to be a deep field. That is, if the data field you want to filter is nested or is in an array (or maybe both), we can still fill in the `<pwc-choices>` options, and filter that data for you.

The format is as follows: `foo.bar.baz`.

This means that you want to filter `baz` field which is under `bar` field, which is again under `foo` field of the root object.

##### Rules of deep value retreival

- If we encounter an object on traversal, we simple move in the object.
- If we encounter an array on traversal, we move in to the each item in the array separately, thus returning an array as the result of this treversal step.

##### Rules of deep filter

- If we encounter an object on traversal, we mark the object as valid if it satisfies the condition.
- If we encounter an array on traversal, `any` will be used, not `all`. This means if any of the items in the array satisfy the condition, we mark the whole array as valid.

##### Example

Item Config:

```js
{
    dataField: "a.b.c",
    type: "select-multiple",
    label: "a.b.c filter element",
}
```

Data:

```js
const data = [
  {
    a: [
      {
        b: [
          {
            c: "foo",
            d: "non_relevant_value"
          },
          {
            c: "bar",
            d: "non_relevant_value"
          }
        ],
        e: "first one"
      }
    ]
  },
  {
    a: [
      {
        b: [
          {
            c: "baz",
            d: "non_relevant_value"
          },
          {
            c: "bar",
            d: "non_relevant_value"
          }
        ],
        e: "second one"
      }
    ]
  },
  {
    a: [
      {
        b: [
          {
            c: "foo",
            d: "non_relevant_value"
          },
          {
            c: "foo",
            d: "non_relevant_value"
          }
        ],
        e: "third one"
      }
    ]
  }
];
```

Options of the generated `<pwc-choices>` form element:

- `bar`
- `baz`
- `foo`

The filter result when you filter for `baz` (i.e. select `baz` from the list):

```json
[
  {
    "a": [
      {
        "b": [
          {
            "c": "baz",
            "d": "non_relevant_value"
          },
          {
            "c": "bar",
            "d": "non_relevant_value"
          }
        ],
        "e": "second one"
      }
    ]
  }
]
```

#### `NativeItemConfig` Interface

`extends ItemConfig, JSXBase.HTMLAttributes<HTMLInputElement>`

This interface is used for native HTML input elements. It supports all valid `<input>` attributes as well as all the attributes defined in `ItemConfig` interface.

#### `PwcSelectItemConfig` Interface

`extends ItemConfig, JSXBase.HTMLAttributes<HTMLPwcChoicesElement>`

```ts
type: PwcSelectType;
distinct?: PwcChoicesDistinctMode;
placeholder?: string;
labelProvider?: (value: string) => string;
```

- `type`: The type of this `pwc-choices` element. Valid options: `select-single`, `select-multiple`, `select-text`.
- `distinct`: Optional, defaults to `none`. The type of distinct option filtering to be applied on this `pwc-choices` element's options. Valid options: `value`, `label`, `all`, `none`.
- `placeholder`: Optional. This will be the placeholder text of the `pwc-choices` element.
- `labelProvider`: Optional. This function will be called for each choice's `value` field and is expected to return the `label` field of that choice. If not provided, `value` will be used for `label` as well.

This interface is used for `<pwc-choices>` elements. It supports all valid `<pwc-choices>` attributes as well as all the attributes defined in `ItemConfig` interface.

##### `PwcSelectType` Type Union

`type PwcSelectType = "select-single" | "select-multiple" | "select-text"`

The leading `select` is stripped out on `<pwc-choices>` generation and remaining `single`, `multiple`, or `text` is passed to the element config.

See [`pwc-choices` readme](https://github.com/Paraboly/pwc-choices#configuration) for more information.

##### `PwcChoicesDistinctMode` Type Union

`type PwcChoicesDistinctMode = "value" | "label" | "all" | "none"`

See [`pwc-choices` readme](https://github.com/Paraboly/pwc-choices#configuration) for more information.

#### `ColorPickerItemConfig` Interface

`extends ItemConfig, JSXBase.HTMLAttributes<HTMLColorPickerElement>`

```ts
type: "color";
```

- `type`: Only `color` is supported.

This interface is used for `<color-picker>` elements. It supports all valid `<color-picker>` attributes as well as all the attributes defined in `ItemConfig` interface.

## `filterChanged` Event

`filterChanged: EventEmitter<PwcFilter.FilterChangedEventPayload>`

This event will be emitted when the underlying `pwc-dynamic-form` emits a [`formChanged` event](https://github.com/Paraboly/pwc-dynamic-form/blob/master/documentation.md#formchanged-event).

### Payload (`PwcFilter.FilterChangedEventPayload` Interface)

```ts
originalEvent: PwcDynamicForm.FormChangedEventPayload;
filterResult: object[];
```

- `originalEvent`: The payload of the `formChanged` event that caused this event to fire.
- `filterResult`: When we receive the `formChanged` event, we automatically filter the data with the new form values received. Then we pass that filter result on this field.

## `filter` Method

`async filter(): Promise<object[]>`

This method allows you to filter the current data at any time with the current form values.
