const path = require('path');
const SWITCHES = ['mastering', 'compressing', 'coverArt', 'metadata', 'renaming'];
const OUTPUT_FORMATS = ['mp3', 'wav', 'flac'];

function planProcessing(settings, inputPath) {
    const sourceFormat = path.extname(inputPath).slice(1).toLowerCase();
    const selected = settings.output.format;
    if (selected !== 'source' && !OUTPUT_FORMATS.includes(selected)) {
        throw new Error(`Unsupported output format: ${selected}`);
    }
    const dsp = settings.processing.mastering || settings.processing.compressing;
    // Preserve other source containers for metadata/rename/art-only operations.
    // An unsupported source container needing DSP becomes lossless FLAC.
    const format = selected === 'source'
        ? (dsp && !OUTPUT_FORMATS.includes(sourceFormat) ? 'flac' : sourceFormat)
        : selected;
    const conversion = selected !== 'source' || settings.output.sampleRate > 0 || format !== sourceFormat;
    const active = SWITCHES.some(key => settings.processing[key]);
    return {
        format, sourceFormat, conversion,
        transcode: format !== sourceFormat || settings.output.sampleRate > 0,
        active, noOp: !active && !conversion,
        copyAudio: !dsp && format === sourceFormat && settings.output.sampleRate === 0
    };
}

module.exports = { SWITCHES, OUTPUT_FORMATS, planProcessing };
