export const seedPhraseLengthToStrength = (length: number): number => {
  switch (length) {
    case 12:
      return 128;
    case 15:
      return 160;
    case 18:
      return 192;
    case 21:
      return 224;
    case 24:
      return 256;
    default:
      return 128;
  }
};
