# Sim City map images

Paint two PNG files with the **same width and height** (1 pixel = 1 tile).

## Files

- `terrain.png` — land, rivers, mountains
- `resources.png` — trees, ore (black = nothing)

## Terrain colors (RGB)

| Tile | Color | Hex |
|------|-------|-----|
| water | 34, 68, 255 | `#2244ff` |
| grass | 68, 170, 68 | `#44aa44` |
| mountain | 120, 120, 120 | `#787878` |

## Resource colors (RGB)

| Resource | Color | Hex |
|----------|-------|-----|
| none | 0, 0, 0 | `#000000` |
| wood | 139, 90, 43 | `#8b5a2b` |
| iron | 180, 60, 60 | `#b43c3c` |

Wood only spawns on grass tiles. Iron only on mountains.

## Regenerate sample maps

```bash
node scripts/create-sample-sim-city-maps.mjs
```
