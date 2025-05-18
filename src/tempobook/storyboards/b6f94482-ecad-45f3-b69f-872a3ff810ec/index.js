import PageHeader from '@/components/ui/PageHeader';

export default function PageHeaderStoryboard() {
  return (
    <div className="bg-white p-4">
      <PageHeader
        title="Patient Management"
        subtitle="View and manage patient records"
        actionButton={{
          label: 'Add Patient',
          onClick: () => alert('Add Patient clicked'),
        }}
      />

      <div className="mt-8">
        <PageHeader title="Reports" subtitle="View analytics and reports" />
      </div>
    </div>
  );
}
