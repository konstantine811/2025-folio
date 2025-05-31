export function parseDates(dates: string[]) {
  return dates
    .map((date) => parseDate(date))
    .filter((d) => !isNaN(d.getTime())); // фільтруємо некоректні дати
}

export function parseDate(date: string): Date {
  const [day, month, year] = date.split(".");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function isFutureDate(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsedDate = parseDate(date); // теж має бути без часу
  if (today < parsedDate) {
    return true;
  }
}
