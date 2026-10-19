// Renders LineMap from the packed tarball in a fresh consumer project to make
// sure the published build works against the installed React version.
// Run from a directory where @transitmatters/stripmap, react, react-dom, and
// jsdom are installed.

const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    pretendToBeVisual: true,
});
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'SVGElement', 'Node']) {
    Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true, writable: true });
}
// jsdom has no layout engine, so stub the SVG geometry LineMap measures
dom.window.SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 100 });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');

const render = async (stripmap, label) => {
    const { LineMap, createRedLineDiagram, createGreenLineDiagram } = stripmap;
    assert.equal(typeof LineMap, 'function', `${label}: LineMap is exported`);

    for (const diagram of [createRedLineDiagram(), createGreenLineDiagram()]) {
        const container = document.getElementById('root');
        const root = createRoot(container);
        await act(async () => {
            root.render(React.createElement(LineMap, { diagram }));
        });
        const svg = container.querySelector('svg');
        assert.ok(svg, `${label}: rendered an <svg>`);
        assert.ok(svg.querySelectorAll('path').length > 0, `${label}: rendered <path> elements`);
        await act(async () => root.unmount());
    }
    console.log(`${label}: OK`);
};

const main = async () => {
    console.log(`React ${React.version}, Node ${process.version}`);

    // `main` entry (UMD build, loaded as CommonJS)
    await render(require('@transitmatters/stripmap'), 'umd');

    // ES module build
    const pkgDir = path.dirname(require.resolve('@transitmatters/stripmap/package.json'));
    const esm = await import(pathToFileURL(path.join(pkgDir, 'dist', 'stripmap.mjs')).href);
    await render(esm, 'esm');
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
