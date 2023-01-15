export function numberToArray(number: number) {
  const array = [...Array(number + 1).keys()];
  array.shift(); // remove 0
  return array;
}

export function getCurrentDate() {
  const rawDate = new Date();
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(rawDate);
}
