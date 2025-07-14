import { useParams } from "wouter";
import IncentiveDetails from "@/components/incentives/IncentiveDetails";

export default function IncentiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Incentive ID is required</div>;
  }
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <IncentiveDetails id={id} />
    </div>
  );
}
