# Format

We expect a `pwc-dynamic-form` in the slot. We will use its methods to retreive the data.

# Binding of a data field and a form element

## Convention

Form Element Name Attribute = Data Field Name + `_bind`

## Example

If this is our data:

```json
{
  "foo": 41,
  "bar": 19.8397,
  "baz": "Kristine"
}
```

And we want to bind `foo` field to an element, that element's config should look like this:

```json
{
    ...
    "name": "foo_bind",
    ...
}
```

# Notes

- `...` stand for omitted parts.
