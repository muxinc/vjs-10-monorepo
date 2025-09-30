# E2E Equivalence Test Demos

Minimal demo applications for testing React vs Web Component equivalence.

## Web Component Demo

**Location:** `wc-demo.html`

Simple HTML page that loads the compiled MediaSkinDefault web component.

**To run:**

```bash
# Serve with any static server
npx serve .
# Or open directly in browser
open wc-demo.html
```

## React Demo

**Location:** `react-demo/`

Minimal React + Vite application with stub MediaSkinDefault component.

**To run:**

```bash
cd react-demo
npm install
npm run dev
```

Runs on http://localhost:5174

## Notes

- Both demos use the same video URL for consistency
- React demo uses extracted CSS from the compiled WC output
- Stubs match the structure of compiled output for equivalence testing
- Not full-featured implementations - just enough for E2E style validation
