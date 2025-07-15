import DashboardCard from '@/app/components/common/DashboardCard';
import DeliveryDataGenerator from '@/app/components/admin/DeliveryDataGenerator';

export default function DevPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">개발자 도구</h1>
        <p className="text-gray-600 mt-1">개발 및 테스트를 위한 도구들입니다.</p>
      </div>

      <DashboardCard title="배달 데이터 생성">
        <DeliveryDataGenerator />
      </DashboardCard>
    </div>
  );
}
