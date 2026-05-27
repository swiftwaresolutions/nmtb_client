# Universal Scrollable Page Template

## Critical CSS Pattern for Scrollable Pages

This template ensures that page content is always scrollable while keeping headers/toolbars fixed. Apply this pattern to ALL new pages.

### HTML Structure Pattern

```tsx
<div className="main-container">
  <Sidebar moduleType="..." subModuleName="..." />
  <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
    
    {/* Fixed Header */}
    <div className="page-header">
      {/* Header content - always visible */}
    </div>

    {/* Fixed Toolbar/Search */}
    <div className="toolbar">
      {/* Toolbar content - always visible */}
    </div>

    {/* Scrollable Content Area */}
    <div className="content-area">
      <div className="main-panel">
        <div className="table-wrapper">
          <table className="compact-table">
            {/* Scrollable table content */}
          </table>
        </div>
      </div>

      {/* Optional Sidebar */}
      {showSidebar && (
        <div className="side-panel">
          <div className="panel-header">
            {/* Fixed panel header */}
          </div>
          <div className="panel-content">
            {/* Scrollable panel content */}
          </div>
        </div>
      )}
    </div>
  </div>
</div>
```

### Required CSS Pattern

```css
/* Main Container - Always use flex */
.main-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

/* Main Content - CRITICAL: height: 100vh and overflow: hidden */
.main-content {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100vh;          /* ⚠️ REQUIRED for scrolling */
  overflow: hidden;       /* ⚠️ REQUIRED - prevents double scrollbars */
}

.main-content.collapsed {
  margin-left: 80px;
}

/* Fixed Header - No flex, fixed height */
.page-header {
  background: /* your gradient */;
  padding: 12px 20px;
  /* No flex properties here */
}

/* Fixed Toolbar - No flex, fixed height */
.toolbar {
  background: white;
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
  /* No flex properties here */
}

/* Content Area - CRITICAL: flex: 1, overflow: hidden, min-height: 0 */
.content-area {
  flex: 1;                /* ⚠️ REQUIRED - takes remaining space */
  display: flex;
  overflow: hidden;       /* ⚠️ REQUIRED - contains scrolling children */
  min-height: 0;          /* ⚠️ REQUIRED - allows flex child to shrink */
}

/* Main Panel - CRITICAL: flex: 1, overflow: hidden, min-height: 0 */
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;       /* ⚠️ REQUIRED */
  min-height: 0;          /* ⚠️ REQUIRED */
}

/* Table Wrapper - CRITICAL: flex: 1, overflow: auto, min-height: 0 */
.table-wrapper {
  flex: 1;                /* ⚠️ REQUIRED - takes remaining space */
  overflow: auto;         /* ⚠️ REQUIRED - enables scrolling */
  min-height: 0;          /* ⚠️ REQUIRED - allows shrinking */
}

/* Sticky Table Header */
.compact-table thead {
  position: sticky;
  top: 0;
  background: #f8f9fa;
  z-index: 10;
}

/* Side Panel - CRITICAL: display: flex, flex-direction: column, min-height: 0 */
.side-panel {
  width: 300px;
  background: white;
  border-left: 2px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  min-height: 0;          /* ⚠️ REQUIRED */
}

/* Panel Header - Fixed, no flex */
.panel-header {
  padding: 12px 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

/* Panel Content - CRITICAL: flex: 1, overflow-y: auto, min-height: 0 */
.panel-content {
  flex: 1;                /* ⚠️ REQUIRED */
  overflow-y: auto;       /* ⚠️ REQUIRED - enables vertical scrolling */
  padding: 10px;
  min-height: 0;          /* ⚠️ REQUIRED */
}
```

## Key Rules for Scrollable Pages

### ✅ DO:
1. Always set `height: 100vh` on `.main-content`
2. Always add `min-height: 0` to flex children that need to scroll
3. Use `overflow: hidden` on containers, `overflow: auto` on scrollable areas
4. Use `flex: 1` on elements that should take remaining space
5. Keep headers/toolbars as non-flex elements (fixed height)
6. Use `position: sticky` for table headers

### ❌ DON'T:
1. Never use `height: calc(100vh - ...)` on scrollable areas
2. Don't add `overflow: auto` to the main-content (causes double scrollbars)
3. Don't forget `min-height: 0` on flex children (prevents shrinking)
4. Don't use fixed heights on main scrollable containers
5. Don't add flex to headers/toolbars that should stay fixed

## Testing Checklist

After creating a new page, verify:
- [ ] Header stays fixed when scrolling
- [ ] Toolbar stays fixed when scrolling
- [ ] Table content scrolls smoothly
- [ ] Sidebar panel scrolls independently (if present)
- [ ] No double scrollbars appear
- [ ] Works with sidebar collapsed/expanded
- [ ] Sticky table headers work correctly
- [ ] Content doesn't overflow viewport

## Common Issues & Fixes

### Issue: Content not scrolling
**Fix:** Add `min-height: 0` to all flex parents of scrollable area

### Issue: Double scrollbars
**Fix:** Change `overflow: auto` to `overflow: hidden` on parent containers

### Issue: Header scrolls with content
**Fix:** Remove flex properties from header, ensure content-area has `flex: 1`

### Issue: Table too short
**Fix:** Ensure main-content has `height: 100vh` and content-area has `flex: 1`

## Complete Example Files

Reference these files for working implementations:
- `src/central-stores/pages/medical-store/transferOrder/PrepareTransfer.tsx`
- `src/central-stores/pages/medical-store/consumableOrder/ConsumableOrder.tsx`

Both files implement this pattern perfectly.
