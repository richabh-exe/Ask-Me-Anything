/** Whole years between a YYYY-MM-DD birth date and `now`, or null when invalid. */
export function ageFrom(dob: string, now = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!match) return null;
  const [y, m, d] = match.slice(1).map(Number);
  const birth = new Date(y, m - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth > now) return null;
  let age = now.getFullYear() - y;
  const hadBirthday = now.getMonth() > m - 1 || (now.getMonth() === m - 1 && now.getDate() >= d);
  if (!hadBirthday) age -= 1;
  return age > 120 ? null : age;
}

export const MIN_AGE = 18;
