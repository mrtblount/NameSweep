---
name: visual-check
description: Quick visual verification of current page
---

# Visual Check Command

Performs a quick visual check of the current development server.

## Process:
1. Launch Playwright browser
2. Navigate to localhost (detect port automatically)
3. Take screenshot of current state
4. Check console for errors
5. Compare against any provided mockups or specifications
6. Report findings

## Usage:
```
/visual-check [optional: specific page path]
```

## Output:
- Screenshot saved to project
- Console errors (if any)
- Visual discrepancies from spec
- Suggested improvements

## Example Commands:
- `/visual-check` - Check homepage
- `/visual-check /generator` - Check generator page
- `/visual-check /api/check?name=test` - Check API response