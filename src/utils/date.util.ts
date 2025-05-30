export function parseDates(dates: string[]) {
  return dates
    .map((date) => parseDate(date))
    .filter((d) => !isNaN(d.getTime())); // фільтруємо некоректні дати
}

export function parseDate(date: string) {
  const [day, month, year] = date.split(".");
  return new Date(`${year}-${month}-${day}`);
}
