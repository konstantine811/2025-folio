import { z } from "zod";

const vector = z.tuple([z.number().finite(), z.number().finite(), z.number().finite()]);
const color = z.string().regex(/^#[\da-f]{6}$/i, "Колір має формат #RRGGBB");
export const entitySchema = z.object({
  id: z.string().min(1).max(60),
  prefab: z.enum(["block", "platform", "tree", "crystal"]),
  position: vector.refine(([x, y, z]) => Math.abs(x) <= 21 && Math.abs(z) <= 21 && y >= 0 && y <= 20, "Позиція: x/z від −21 до 21, y від 0 до 20"),
  size: vector.refine(v => v.every(n => n >= 0.2 && n <= 12), "Розмір: від 0.2 до 12"),
  color,
}).strict();
export const worldSchema = z.object({
  name: z.string().min(1).max(60),
  ground: color,
  spawn: vector.refine(([x,y,z]) => Math.abs(x) <= 20 && Math.abs(z) <= 20 && y >= 0 && y <= 20, "Точка появи поза межами світу"),
  entities: z.array(entitySchema).max(200),
}).strict().superRefine((world, context) => {
  const [x, y, z] = world.spawn;
  if (world.entities.some(entity => {
    const [ex, ey, ez] = entity.position;
    const [w, h, d] = entity.size;
    return Math.abs(x - ex) < w / 2 + 0.4 && Math.abs(z - ez) < d / 2 + 0.4 && y < ey + h - 0.02 && y + 2.4 > ey;
  })) {
    context.addIssue({ code: "custom", message: "Точка появи всередині об’єкта. Зміни world.spawn(x, y, z)." });
  }
  if (new Set(world.entities.map(e => e.id)).size !== world.entities.length) {
    context.addIssue({ code: "custom", message: "Об’єкти повинні мати унікальні id" });
  }
});
export type WorldEntity = z.infer<typeof entitySchema>;
export type CodeWorld = z.infer<typeof worldSchema>;
export const emptyWorld = (): CodeWorld => ({ name: "Мій перший світ", ground: "#829b83", spawn: [0, 0, -8], entities: [] });
export const SOURCE_LIMIT = 20000;
