export function omitObjectProperty<T, K extends keyof T> (
  obj: T,
  key: K
): Omit<T, K> {
  const {[key]: _, ...objectWithoutProp} = obj;
  return objectWithoutProp;
}