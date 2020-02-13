import Enumerable from "linq";
// import _ from "lodash";

export function resolveJson<TReturnType>(
  input: string | TReturnType
): TReturnType {
  return typeof input === "string" ? JSON.parse(input) : input;
}

export function deepFilter(data: any, key: string, value: any) {
  const navigationSteps = key.split(".");

  return Enumerable.from(data)
    .where(datum => deepValidate(datum, 0))
    .toArray();

  function deepValidate(currentObj, navStepIndex: number): boolean {
    // if we are out of navigation steps, check for the value
    if (navStepIndex === navigationSteps.length) {
      if (value instanceof Array) {
        // tslint:disable-next-line:triple-equals
        return Enumerable.from(value).any(v => v == currentObj);
      } else {
        // tslint:disable-next-line:triple-equals
        return currentObj == value;
      }
    }

    const navStep = navigationSteps[navStepIndex];

    if (currentObj instanceof Array) {
      // if we have an array, any element of it needs to match
      return Enumerable.from(currentObj).any(arrayItem =>
        deepValidate(arrayItem[navStep], navStepIndex + 1)
      );
    } else {
      // if we have a single element, then it needs to match
      return deepValidate(currentObj[navStep], navStepIndex + 1);
    }
  }
}

export function isCompoundKey(key: string): boolean {
  return key.includes(".");
}

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

export function deepGet(data: any, key: string): any[] {
  const navigationSteps = key.split(".");

  return Enumerable.from(data)
    .selectMany(datum => deepRetreive(datum, 0))
    .toArray();

  function deepRetreive(currentObj, navStepIndex: number): any[] {
    // if we are out of navigation steps, return the value.
    if (navStepIndex === navigationSteps.length) {
      return [currentObj];
    }

    const navStep = navigationSteps[navStepIndex];

    if (currentObj instanceof Array) {
      // if we have an array, return all of the elements.
      return Enumerable.from(currentObj)
        .selectMany(arrayItem =>
          deepRetreive(arrayItem[navStep], navStepIndex + 1)
        )
        .toArray();
    } else {
      // if we have a single element, then return it.
      return deepRetreive(currentObj[navStep], navStepIndex + 1);
    }
  }
}

// function deepReplace(data, oldValue, newValue) {
//   // we catch the value, just replace it and shortcut.
//   if (data === oldValue) {
//     return newValue;
//   }

//   // don't iterate characters of a string.
//   if (typeof data === "string") {
//     return data;
//   }

//   // we have an array, iterate over all elements.
//   if (data instanceof Array) {
//     return data.map(item => deepReplace(item, oldValue, newValue));
//   }

//   // we have an object, iterate over properties.
//   return _.transform(
//     data,
//     (r: any, v: any, k: any) =>
//       (r[k.trim()] = deepReplace(v, oldValue, newValue))
//   );
// }
