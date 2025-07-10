// here we put scripts which are used in multiple places

export function GetDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

export const PlantRadii = {
    lettuce: 15,
    tomato: 30,
    radish: 2,
}