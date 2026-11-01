/** Actual Electron renderer capture, isolated from the real app/userData. */
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const userData = fs.mkdtempSync(path.join(os.tmpdir(), 'hexbloop-electron-visual-'));
app.setPath('userData', userData);
app.on('before-quit', () => fs.rmSync(userData, { recursive: true, force: true }));

app.whenReady().then(async () => {
    const root = path.join(__dirname, '..');
    const outputDir = process.env.HEXBLOOP_VISUAL_OUTPUT || os.tmpdir();
    const window = new BrowserWindow({
        width: 800, height: 600, minWidth: 800, minHeight: 600, show: false,
        titleBarStyle: 'hiddenInset', backgroundColor: '#0D0D1A',
        webPreferences: { preload: path.join(__dirname, 'electron-visual-preload.js'),
            nodeIntegration: false, contextIsolation: true, offscreen: true }
    });
    const problems = [];
    window.webContents.on('console-message', event => {
        if (event.level >= 3) problems.push(event.message);
    });
    await window.loadFile(path.join(root, 'src/renderer/index.html'));
    await window.webContents.executeJavaScript('new Promise(resolve => requestAnimationFrame(resolve))');
    const capture = async (label, width, height) => {
        window.setContentSize(width, height);
        // Offscreen capture can otherwise return the previous compositor frame
        // even though DOM geometry already reflects the new receipt/state.
        await window.webContents.executeJavaScript(`new Promise(resolve =>
            requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 120))))`);
        const image = await window.webContents.capturePage();
        if (image.isEmpty()) throw new Error(`Electron capture empty: ${label}`);
        const file = path.join(outputDir, `hexbloop-phase-d-${process.pid}-${label}.png`);
        fs.writeFileSync(file, image.toPNG());
        const layout = await window.webContents.executeJavaScript(`(() => {
            const box = selector => { const r = document.querySelector(selector).getBoundingClientRect();
                return { top:r.top, bottom:r.bottom, left:r.left, right:r.right }; };
            const text = selector => { const e = document.querySelector(selector);
                return { text:e.textContent, width:e.clientWidth, scrollWidth:e.scrollWidth }; };
            return { dock:box('.processing-switches'), format:box('.quick-output'),
                hex:box('.hex-outer'), receipt:box('#batchReceipt'),
                receiptVisible:!document.getElementById('batchReceipt').hidden,
                progressVisible:document.querySelector('.app-container').classList.contains('is-processing'),
                progress:box('.progress-text'), utilities:box('#utilityRail'),
                track:box('#receiptPosition'), status:box('#previewStatus'),
                trackText:text('#receiptPosition'), statusText:text('#previewStatus'),
                receiptGroups:['.receipt-count','.transport-audio','.receipt-track','#flipAB','.transport-actions'].map(box),
                viewport:{ width:innerWidth, height:innerHeight },
                summary:document.getElementById('receiptSummary').textContent };
        })()`);
        const overlaps = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
        const inside = r => r.left >= 0 && r.top >= 0 && r.right <= layout.viewport.width + 0.5 && r.bottom <= layout.viewport.height + 0.5;
        if (layout.dock.left < 0 || layout.dock.right > layout.viewport.width ||
            layout.format.bottom >= layout.hex.top) throw new Error(`Electron layout overlap: ${JSON.stringify(layout)}`);
        if (layout.progressVisible && (!inside(layout.progress) || overlaps(layout.progress, layout.utilities) ||
            overlaps(layout.progress, layout.hex))) {
            throw new Error(`Progress overlaps hex/utilities or viewport: ${JSON.stringify(layout)}`);
        }
        if (layout.receiptVisible) {
            if (!inside(layout.receipt) || overlaps(layout.track, layout.status) ||
                layout.statusText.scrollWidth > layout.statusText.width + 1 || layout.statusText.text !== 'No preview' ||
                layout.trackText.scrollWidth > layout.trackText.width + 1 || !layout.trackText.text.includes('track-0.wav')) {
                throw new Error(`Receipt clipped readout: ${JSON.stringify(layout)}`);
            }
            for (let i = 1; i < layout.receiptGroups.length; i++) {
                if (overlaps(layout.receiptGroups[i - 1], layout.receiptGroups[i])) {
                    throw new Error(`Receipt group overlap: ${JSON.stringify(layout)}`);
                }
            }
        }
        console.log(`${label}: ${layout.viewport.width}×${layout.viewport.height} · ${layout.summary} · ${file}`);
    };
    await capture('dock-800', 800, 600);
    await window.webContents.executeJavaScript(`window.hexbloopMystic.startProcessing();
        window.hexbloopMystic.updateProgress({current:2,total:30,fileName:'demo.wav',status:'processing'});`);
    await window.webContents.executeJavaScript('new Promise(resolve => setTimeout(resolve, 380))');
    await capture('progress-800', 800, 600);
    await window.webContents.executeJavaScript(`window.hexbloopMystic.updateProgress({current:29,total:30,
        fileName:'Long_session_recording_with_many_descriptive_words_'.repeat(4) + 'take_28.wav',status:'processing'});`);
    await capture('progress-long-800', 800, 600);
    await window.webContents.executeJavaScript(`window.hexbloopMystic.stopProcessing();
        window.hexbloopMystic.processFiles(['/test'])`);
    await capture('receipt-800', 800, 600);
    await capture('receipt-1200', 1200, 800);
    await capture('receipt-1440', 1440, 900);
    await capture('receipt-1728', 1728, 1117);
    if (problems.length) console.log(`Renderer console notes: ${problems.slice(0, 4).join(' | ')}`);
    window.close();
    app.quit();
}).catch(error => {
    console.error(error);
    fs.rmSync(userData, { recursive: true, force: true });
    app.exit(1);
});
