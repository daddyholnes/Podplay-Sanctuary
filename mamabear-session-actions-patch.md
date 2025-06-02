# MamaBear Session Actions Patch

This patch contains all the code you need to add session action handlers (rename, delete, export) to the MamaBear chat interface. I've already implemented the action handler component in `/components/MamaBearSessionActions.tsx`.

## Step 1: Add Import

Add this import at the top of your `mamabearmainchat.tsx` file, right after your existing imports:

```typescript
import { getSessionMenuItems as getSessionMenuItemsFromActions } from '../components/MamaBearSessionActions';
```

## Step 2: Replace Session Menu Items

Replace the existing session menu items function with this implementation. Look for this section (around line 330):

```typescript
// Original code to replace:
// Session menu items
const getSessionMenuItems = (session: ChatSession): MenuItem[] => [
  {
    id: 'rename',
    label: 'Rename',
    icon: <FileText size={16} />,
    onClick: () => {/* TODO: Implement rename */}
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash size={16} />,
    onClick: () => {/* TODO: Implement delete */}
  },
  {
    id: 'export',
    label: 'Export',
    icon: <Save size={16} />,
    onClick: () => {/* TODO: Implement export */}
  }
];
```

Replace with:

```typescript
// Session menu items with integrated handlers
const getSessionMenuItems = (session: ChatSession): MenuItem[] => {
  return getSessionMenuItemsFromActions(session, {
    setSessions,
    setActiveChat,
    setMessages,
    setIsLoading,
    displayToast
  });
};
```

## Step 3: Remove Any Duplicate Component Definitions

The file currently has multiple duplicate component definitions, which is causing our edit issues. Find and remove any duplicate `MamaBearMainChat` component definitions, keeping only the main one (around line 110). The file should only have ONE component named `MamaBearMainChat`.

## Testing the Implementation

After making these changes:

1. Start the development server
2. Create a new chat session
3. Test the rename, delete, and export functionality
4. Verify toast notifications appear with the proper purple theme
5. Verify state updates correctly (especially after rename/delete)

## Features Added

- **Rename Session**: Prompts for a new name and updates the session list and active chat
- **Delete Session**: Confirms deletion and removes from state and backend
- **Export Session**: Downloads all session data as a JSON file
- **Visual Feedback**: Toast notifications with purple theming for success messages
- **Error Handling**: Proper error handling and feedback for all operations

All functionality is fully integrated with the backend API, and type-safe with TypeScript.
