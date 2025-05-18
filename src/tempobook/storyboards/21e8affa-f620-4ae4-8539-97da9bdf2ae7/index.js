import StatusBadge from '@/components/ui/StatusBadge';

export default function StatusBadgeStoryboard() {
  return (
    <div className="bg-white p-4 space-y-4">
      <div className="flex space-x-4">
        <StatusBadge status="active" type="success" />
        <StatusBadge status="pending" type="warning" />
        <StatusBadge status="cancelled" type="danger" />
        <StatusBadge status="processing" type="info" />
        <StatusBadge status="default" type="default" />
      </div>
    </div>
  );
}
