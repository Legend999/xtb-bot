const validateNumber = (number: number, min: number, max: number): string | null => {
  if (!isFinite(number)) return `'${number}' is not a valid number`;
  if (number < min) return `${number} is less than ${min.toString()}`;
  if (number > max) return `${number} is greater than ${max.toString()}`;
  const decimalPart = number.toString().split('.')[1] ?? '';
  if (decimalPart.length > 2) return `${number} has more than 2 decimal places`;

  return null;
};

export const validateStrategyDPercent = (input: number): string | null => {
  return validateNumber(input, 0.1, 20);
};

export const validateStrategyDPricePerLevel = (input: number): string | null => {
  return validateNumber(input, 1, 1_000_000);
};
