export const toEnum = <T extends { [key: string]: string }>(
  enumObj: T,
  value: string,
): T[keyof T] => {
  for (const key in enumObj) {
    if (enumObj[key] === value) {
      return enumObj[key];
    }
  }
  throw new Error(`Invalid enum value: ${value}`);
};
