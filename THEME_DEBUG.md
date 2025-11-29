# Theme System Debug Instructions

## If Dark Mode Toggle Isn't Working

### Step 1: Clear Your Browser's localStorage

The theme state is saved in your browser. Old data can prevent the toggle from working.

**Clear localStorage:**
1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Run this command:
```javascript
localStorage.clear()
```
4. Refresh the page (Ctrl+R or Cmd+R)

### Step 2: Verify Theme in Console

After clearing localStorage, check that the theme system is working:

1. Open Console (F12)
2. You should see: `"Theme applied: light"` or `"Theme applied: dark"`
3. Click the Moon/Sun icon in the navbar
4. The page should switch themes immediately

### Step 3: Check HTML Element

The theme class should be on the `<html>` element:

1. In Developer Tools, go to the **Elements** tab
2. Look at the first line: `<html class="light">` or `<html class="dark">`
3. Click the theme toggle button
4. The class should change from `light` to `dark` or vice versa

## Current Theme Colors

### Light Mode (Default)
- Background: White (#FFFFFF)
- Text: Dark Slate (#0F172A)
- Primary: Emerald Green (#10B981)
- Accent: Orange (#F97316)

### Dark Mode
- Background: Dark Navy (#0F172A)
- Text: Light Gray (#F1F5F9)
- Primary: Bright Emerald (#34D399)
- Accent: Bright Orange (#FB923C)

## Theme Toggle Button

- **Moon Icon** 🌙 = Currently in LIGHT mode (click to switch to dark)
- **Sun Icon** ☀️ = Currently in DARK mode (click to switch to light)

## Common Issues

### Issue: Page stuck in dark mode
**Fix:** Clear localStorage (see Step 1 above)

### Issue: Toggle button doesn't change icon
**Fix:**
1. Clear localStorage
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Clicking toggle does nothing
**Fix:**
1. Check Console for errors
2. Verify you see "Theme applied: ..." messages
3. Clear browser cache and localStorage

## Technical Details

### Where Theme is Stored
- **localStorage key**: `greenlean-theme`
- **Default value**: `{ "isDarkMode": false }`

### How Toggle Works
1. Click moon/sun icon in navbar
2. Calls `setTheme('dark')` or `setTheme('light')`
3. Updates Zustand store
4. Zustand saves to localStorage
5. ThemeProvider adds/removes `.dark` class on `<html>`
6. CSS variables change based on class

### Files Involved
- `src/index.css` - Theme CSS variables
- `src/store/themeStore.ts` - Theme state management
- `src/core/providers/ThemeProvider.tsx` - Theme application logic
- `src/shared/components/layout/NavbarV2.tsx` - Toggle button
- `tailwind.config.ts` - Tailwind configuration

## Still Not Working?

If after following all steps the theme still doesn't work:

1. **Try Incognito/Private Window** - This starts with fresh localStorage
2. **Check Node version** - Should be 18+
3. **Rebuild**: `npm run build`
4. **Check for TypeScript errors**: `npm run build`

## Expected Behavior

1. First visit → Light mode
2. Click moon icon → Switches to dark mode
3. Refresh page → Stays in dark mode (saved in localStorage)
4. Click sun icon → Switches back to light mode
5. Theme persists across page navigation
