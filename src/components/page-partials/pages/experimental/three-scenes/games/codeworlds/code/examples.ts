export const EXAMPLES = [
  { name: "Острів початківця", code: `// Зміни код і натисни «Створити світ».
// position — центр основи об’єкта, y — висота над землею.
world.name("Origin Island");
world.ground("#829b83");
world.spawn(0, 0, -8);

const colors = ["#cfad73", "#6e9eaa", "#b89ac9"];
for (let i = 0; i < 3; i++) {
  world.create("block", {
    id: "tower-" + i,
    position: [-6 + i * 6, 0, 5],
    size: [3, 1 + i, 3],
    color: colors[i]
  });
}

for (let i = 0; i < 6; i++) {
  world.create("tree", {
    position: [-15 + i * 6, 0, 14],
    color: "#4f8768"
  });
}
world.create("crystal", { position: [0, 0, 0], color: "#88e7dd" });
console.log("Ласкаво просимо на острів!");` },
  { name: "Міст через долину", code: `world.name("Bridge Builder");
world.ground("#567e91");
world.spawn(-14, 0, -5);

// Цикл будує міст з окремих платформ.
for (let i = 0; i < 9; i++) {
  world.create("platform", {
    position: [-12 + i * 3, 0, 0],
    size: [2.8, 0.5, 4],
    color: i % 2 === 0 ? "#d4b27a" : "#b89162"
  });
}
world.create("crystal", { position: [15, 0, 0], color: "#ffc76b" });
console.log("Міст готовий: 9 платформ");` },
  { name: "Містечко з циклів", code: `world.name("Loop City");
world.ground("#7d9583");
world.spawn(0, 0, -17);

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 4; col++) {
    const height = 2 + (row + col) % 4;
    world.create("block", {
      position: [-12 + col * 8, 0, -6 + row * 8],
      size: [4, height, 4],
      color: height > 3 ? "#7a9fae" : "#dfb783"
    });
  }
}
console.log("Побудовано 12 будинків");` },
] as const;
