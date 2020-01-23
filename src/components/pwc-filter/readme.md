# pwc-filter

<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type                     | Default     |
| -------- | --------- | ----------- | ------------------------ | ----------- |
| `data`   | `data`    |             | `object[] \| string`     | `undefined` |
| `items`  | `items`   |             | `ItemConfig[] \| string` | `undefined` |


## Events

| Event           | Description | Type                                     |
| --------------- | ----------- | ---------------------------------------- |
| `filterChanged` |             | `CustomEvent<FilterChangedEventPayload>` |


## Methods

### `filter() => Promise<object[]>`



#### Returns

Type: `Promise<object[]>`




## Dependencies

### Depends on

- pwc-dynamic-form
- pwc-dynamic-form-content

### Graph
```mermaid
graph TD;
  pwc-filter --> pwc-dynamic-form
  pwc-filter --> pwc-dynamic-form-content
  pwc-dynamic-form-content --> color-picker
  pwc-dynamic-form-content --> pwc-choices
  pwc-choices --> pwc-choices-input-bar
  pwc-choices --> pwc-choices-dropdown
  pwc-choices-input-bar --> pwc-choices-option-bubble
  style pwc-filter fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
