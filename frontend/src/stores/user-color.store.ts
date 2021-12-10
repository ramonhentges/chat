import { getRandomHSLColor } from '../util/color';

interface UserColor {
  key: string;
  color: string;
}

const userColor: UserColor[] = [];

export const getUserColor = (key: string): string => {
  const color = userColor.find((val) => val.key === key);
  if (color) {
    return color.color;
  }
  const randomColor = getRandomHSLColor();
  userColor.push({ key, color: randomColor });
  return randomColor;
};
