# Hexbloop Phase B — unreleased behavior changes

- Five independent stages: Master, Compress (lunar tape color/compand), Cover Art, Metadata, Rename. MP3/WAV/FLAC is a separate, explicit format choice; Source is the default.
- Legacy naming preferences migrate once to schema v2: `mystical` → Rename on, Metadata on/generated; `custom` → Rename off, Metadata on/custom; `original` → Rename off, Metadata off. **Behavior correction:** older builds still generated “Hexbloop” metadata for `original`; that mode now leaves text tags untouched. `custom` no longer renames files. Existing valid independent settings take precedence over the old naming value.
- Old implicit MP3 output settings migrate to Source to avoid unrequested conversion. A deliberately chosen MP3 format can be selected again; v1 settings could not distinguish that choice from the default.
- All stages off with Source format writes nothing. Rename-only preserves same-format bytes and original tags. Metadata off preserves text tags after audio processing. WAV cover art is saved as `<output_base>_cover.png` beside the audio, not claimed as embedded artwork.
- No commercial release or checkout activation: Phase A binary/legal/Monterey gates remain blocked.
