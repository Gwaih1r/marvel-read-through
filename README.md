# Marvel Read-Through

A reading tracker for the modern Marvel era, in [Continuity Guide](https://www.continuityguide.net) order. Installs to a phone or tablet home screen and syncs progress through Firebase.

## Files

- `index.html`, `app.js`, `app.css`: the app
- `config.js`: Firebase web config (public values; the Firestore rules protect the data)
- `data/chapters.json`: chapter list, years and summaries
- `data/c100.json` to `data/c125.json`: each chapter's reading order. Rows are `["a", series, arc, release dates]` for an arc, `["n", text]` for a guide note and `["i", number, issue, arc, release]` for an issue
- `data/seed.json`: progress copied from the old Google Sheet, imported once on first sign-in
- `firestore.rules`: database rules to paste into the Firebase console
- `sw.js`, `manifest.json`, `icons/`: what makes it installable and work offline
- `tools/build_data.py`: rebuilds the data files from a Google Sheets export

## Progress data

Firestore collection `progress`, one document per chapter (`c100` to `c125`):

```json
{ "reads": { "268": "2026-11-25" }, "ratings": { "54": 4.5 } }
```

`reads` maps the guide's issue number to the date it was read. `ratings` maps an arc's index in the chapter file to a star rating; arcs that share a name share the rating of the first one.

## Updating

Change files, bump `VERSION` in `sw.js` and `APP_VERSION` in `app.js`, then push to `main`. Installed copies pick up the update the next time they open.
