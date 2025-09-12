import { sanitizeName } from "./string.util";

export const makeId = (uid: string, name: string) =>
  `${uid}::${sanitizeName(name)}`;
export const newerThan = (aISO: string, bISO: string) =>
  Date.parse(aISO) > Date.parse(bISO);
