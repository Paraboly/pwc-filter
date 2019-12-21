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

## `items` Prop

`items: string | PwcFilter.ItemConfig[]`

### `PwcFilter.ItemConfig` Interface

#### `NativeItemConfig` Interface

#### `PwcSelectItemConfig` Interface

#### `ColorPickerItemConfig` Interface

## `filterChanged` Event

`filterChanged: EventEmitter<PwcFilter.FilterChangedEventPayload>`

### `PwcFilter.FilterChangedEventPayload` Interface

## `filter` Method

`async filter(): Promise<object[]>`
