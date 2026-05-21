export function createCity(size: number) {
  const data: { x: number; y: number }[][] = [];

  function initialize() {
    for (let x = 0; x < size; x++) {
      const column = [];
      for (let y = 0; y < size; y++) {
        const tile = { x, y };
        column.push(tile);
      }
      data.push(column);
    }
  }
  initialize();
  return {
    size,
    data,
  };
}
