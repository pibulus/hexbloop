const assert = require('assert');
const childProcess = require('child_process');
const originalExec = childProcess.execFileSync;
const calls = [];
const developmentPath = '/opt/homebrew/Cellar/jpeg-turbo/3.1.3/lib';
let load = `cmd LC_RPATH\ncmdsize 88\npath ${developmentPath} (offset 12)`;
let rejectGate = false;
childProcess.execFileSync = (command, args) => {
    calls.push([command, args]);
    if (command === 'otool') return load;
    if (command === 'python3' && rejectGate) throw new Error('Native/legal gate failed');
    return '';
};
const prepare = require('../scripts/prepare-release');
(async () => {
    try {
        const context = { electronPlatformName: 'darwin', arch: 3, appOutDir: '/isolated/package' };
        await prepare(context);
        assert.deepStrictEqual(calls.map(call => call[0]), ['otool', 'install_name_tool', 'python3']);
        assert.deepStrictEqual(calls[1][1].slice(0, 2), ['-delete_rpath', developmentPath]);
        assert(calls[1][1][2].startsWith('/isolated/package/'));
        calls.length = 0;
        load = 'cmd LC_RPATH\ncmdsize 48\npath @loader_path/ (offset 12)';
        await prepare(context);
        assert.deepStrictEqual(calls.map(call => call[0]), ['otool', 'python3']);
        rejectGate = true;
        await assert.rejects(prepare(context), /Native\/legal gate failed/);
        await assert.rejects(prepare({ ...context, arch: 1 }), /Apple Silicon/);
        console.log('Packaged-copy RPATH repair and native gate wiring pass (mocked tools; no binaries changed)');
    } finally {
        childProcess.execFileSync = originalExec;
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
