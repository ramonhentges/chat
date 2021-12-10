export const formatTime = (date: Date): string => {
  return `${date.getHours()}:${
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  }`;
};
