import dynamic from 'next/dynamic';

// Dynamically import the IntegrationWorkbench component to avoid SSR issues
const IntegrationWorkbench = dynamic(() => import('../../../ui-foundation/intergration_workbecnh_enhanced'), { ssr: false });

export default function IntegrationWorkbenchPage() {
  return <IntegrationWorkbench />;
}
