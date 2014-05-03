Version 1.1.0:
 * considerably increased speed of polyfill scan by removing `grasp-equery`
 * added ability to `.include()` & `.exclude()` polyfills #6
 * improved polyfills scan. Now it can find square brackets expressions eg `""["trim"]()` #3
 * improved polyfills scan. Now it can find padded expressions eg `new this.Promise()` or `window.atob()` #4

Version 1.0.10:
 * polyfills for `requestAnimationFrame()`, `cancelAnimationFrame()`
 * it uses semver to compare versions

Version 1.0.9:
 * polyfills for `btoa()`, `atob()`, `matchMedia()`
 * polyfills scanner of polyfills code

Version 1.0.0:
 * Initial release.
