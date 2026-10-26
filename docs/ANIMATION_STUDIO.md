# Animation Studio

Open **Майстерня → Games → Animation Studio · Mixamo**, or `/animation-studio`.

1. Import a Mixamo character as FBX Binary **With Skin**, GLB, or glTF. Select external textures and `.bin` alongside glTF files.
2. Add one or more animation files. Mixamo FBX **Without Skin** is supported. Imported clips are matched by bone names (including Mixamo namespace variants), with rest-orientation correction and scaled hip displacement. Incompatible skeletons are rejected instead of silently dropping animated bones.
3. Preview, rename, remove, and select clips for export in the library.
4. Create a new animation or edit a copy of a library clip. Add up to eight simultaneous layers with body masks, weights, source trim ranges, playback speeds, and looping. Layers start together at time zero.
5. Select a bone and move the playhead. Numerical rotation edits or the local rotation gizmo record an offset key at that time. Keyframe interpolation uses quaternion slerp. Undo/redo applies to composition changes.
6. Save the composition to the library, then export the selected clips and character as GLB or glTF with embedded resources. Composition baking uses 30 FPS, up to 60 seconds.

Files are processed locally. The workspace is held in memory; export before leaving. Exported files contain baked animation clips, not the editable layer arrangement. Reimport an exported character to continue editing a copy of a clip.

If external resources are missing, use **Додати відсутні файли** to select the requested images or `.bin` without selecting the model again. The pending import retains the original files. **Відкрити без текстур** is available only when every missing resource is an image; the model can then be animated and exported without those textures. Missing binary geometry cannot be skipped. Resource matching supports Windows paths, URL encoding, and unambiguous case differences.

The viewport and exported asset use independent skeletons. Viewport helpers, lights, grid, and editing gizmos are excluded from export. Model normalization wraps the original rig rather than changing bind matrices.

Adapted from the adjacent `sich` project: `src/PosePreview.tsx` (bone selection/local rotation tools), `src/Character.tsx` (body masks and restoring animated poses before applying offsets), and `shared/pose.ts` (keyframe authoring). Game networking, admin authentication, weapon-specific IK and fixed character assets are not dependencies of this editor.

## Validation

`node --test scripts/animation-studio.test.mjs` (Node 23 or newer) tests retargeting, incompatible skeleton rejection, body masks, trimming, non-accumulating offsets, quaternion key interpolation, and unique clip names.

For a browser smoke test, import `public/3d-models/sci-fi/character.glb`, add `public/3d-models/render-target-model/animations/Sitting.fbx`, author a clip, export GLB/glTF, and reopen the result to verify the skeleton and clip library.

## Skin weights

Use **Ваги шкіри** to repair bone influence directly on the character. Pause at the problematic pose or enable **Без анімації**, choose a surface and bone, then paint with the left mouse button. On touch screens, select **Пензель** to paint with one finger, or **Огляд** to orbit with one finger and zoom/pan with two. In brush mode, the right mouse button orbits and the wheel zooms; in navigation mode the left button also orbits. Pointer cancellation and release end the current stroke, with one undo entry per gesture. A wire sphere shows brush radius. Blue means zero influence, red means full influence; disable **Кольори впливу** to inspect the original materials.

**Посилити вплив**, **Послабити вплив**, and **Згладити перехід** adjust the selected bone's weight. Other influences are redistributed proportionally, retaining at most four influences per vertex and a total of one. If no other influence exists, the chosen distinct **Резервна кістка** receives the remainder. The brush edits only the selected mesh's connected surface inside the radius; it is not an occlusion mask. Exact coincident seam vertices are connected for smoothing. Body and clothing must be edited separately.

For hip deformation, start with low strength (10–15%), compare Hips and UpLeg influences, and smooth the transition. Every stroke supports undo/redo (30 strokes), and **Відновити ваги поверхні** restores the imported weights with undo support. Weight edits affect every animation and export with the original textures; viewport heatmap materials and brush helpers are never exported. Severe volume collapse caused by topology or extreme poses may still require corrective shapes, which this editor does not yet author.

`node --test scripts/skin-weights.test.mjs` verifies redistribution, fallback, smoothing, disconnected surfaces, shared-geometry isolation, and undo/redo/reset.
