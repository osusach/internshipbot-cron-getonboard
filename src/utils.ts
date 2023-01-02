export function numberToArray(number: number) {
  const array = [...Array(number + 1).keys()];
  array.shift(); // remove 0
  return array;
}
