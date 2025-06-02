## Resource Monitor Panel

The `ResourceMonitorPanel` component provides a real-time view of system metrics (CPU, Memory, Disk, Network) and displays alerts for the current workspace.

### Features
- Live animated metrics for CPU, memory, disk, and network usage
- Alert system for warnings and critical events
- Smooth panel transitions and styled with Emotion and Framer Motion
- Type-safe and fully tested with Vitest + React Testing Library

### Usage

```tsx
import { ResourceMonitorPanel } from './components/workspace/ResourceMonitorPanel';

<ResourceMonitorPanel workspaceId="your-workspace-id" />
```

**Props:**
- `workspaceId` (string): Unique identifier for the workspace to monitor.

### Testing

- Run all frontend tests with:
  ```bash
  npm run test
  ```
- Tests are located in `src/components/workspace/ResourceMonitorPanel.test.tsx`
- Uses Vitest, jsdom, and React Testing Library.

### Extending

- To add new metrics or alert types, update the `Metrics` and `Alert` interfaces in `ResourceMonitorPanel.tsx`.
- For custom icons, use Lucide or add your own SVGs.

---
