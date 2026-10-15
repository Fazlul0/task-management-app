# Tasks

A very simple task management app. No build step, no dependencies.

## Run

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Features

- Add, complete, and delete tasks
- Edit-in-place: double-click a task (or focus + Enter) to rename
- Filter by All / Open / Done
- "Clear done" bulk action
- Keyboard shortcuts: `/` focuses the input, `Esc` clears it
- Tasks and the active filter persist in `localStorage`

## Files

- `index.html` — markup
- `styles.css` — styling
- `app.js` — logic and persistence
