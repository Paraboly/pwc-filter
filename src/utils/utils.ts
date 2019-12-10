import Enumerable from "linq";

export function resolveJson<TReturnType>(
  input: string | TReturnType
): TReturnType {
  return typeof input === "string" ? JSON.parse(input) : input;
}

export function deepFilter(data: any, key: string, value: any) {
  console.log("hello?");
  const navigationSteps = key.split(".");
  const navStepIndex = 0;

  return Enumerable.from(data)
    .where(datum => deepValidate(datum, navStepIndex))
    .toArray();

  function deepValidate(currentObj, navStepIndex: number): boolean {
    // if we are out of navigaiton steps, check for the value
    if (navStepIndex === navigationSteps.length) {
      return currentObj == value;
    }

    const navStep = navigationSteps[navStepIndex];

    if (currentObj instanceof Array) {
      // if we have an array, any element of it needs to match
      return Enumerable.from(currentObj).any(x =>
        deepValidate(x[navStep], navStepIndex + 1)
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
