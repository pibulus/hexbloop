function summarizeBatch(results) {
    const ready = results.filter(item => item.success);
    const issues = results.filter(item => !item.success).map(item => ({
        fileName: item.fileName || (item.originalFile ? item.originalFile.split(/[\\/]/).pop() : 'Batch'),
        reason: item.reason || item.error || 'Not processed'
    }));
    return { ready, issues, summary: `${ready.length} ready · ${issues.length} skipped` };
}

if (typeof module !== 'undefined') module.exports = { summarizeBatch };
if (typeof window !== 'undefined') window.HexbloopBatchReceipt = { summarizeBatch };
