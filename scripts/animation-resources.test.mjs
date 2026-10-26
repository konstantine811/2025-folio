import test from 'node:test';
import assert from 'node:assert/strict';
import { findCompanion, MissingResourcesError, resourceName } from '../src/components/page-partials/pages/experimental/animation-studio/asset-resources.ts';

test('resolves Windows paths, encoded filenames and unique case differences', () => {
  const image = { name: 'tripo_rgb.jpg' };
  assert.equal(findCompanion('C:\\textures\\tripo_rgb.jpg', [image]), image);
  assert.equal(findCompanion('textures%5CTRIPO_RGB.jpg?version=1', [image]), image);
  assert.equal(resourceName('textures/my%20image.jpg'), 'my image.jpg');
});
test('does not guess between ambiguous names', () => {
  assert.equal(findCompanion('texture.jpg', [{ name: 'TEXTURE.JPG' }, { name: 'Texture.jpg' }]), undefined);
});
test('only images can be skipped; binary geometry remains required', () => {
  assert.equal(new MissingResourcesError(['albedo.jpg', 'normal.PNG']).canSkipTextures, true);
  assert.equal(new MissingResourcesError(['albedo.jpg', 'model.bin']).canSkipTextures, false);
  assert.equal(new MissingResourcesError(['unknown']).canSkipTextures, false);
  assert.deepEqual(new MissingResourcesError(['albedo.jpg', 'albedo.jpg']).resources, ['albedo.jpg']);
});
