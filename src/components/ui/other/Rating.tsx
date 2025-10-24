import { formatNumber } from "@/utils/helpers";
import { Star } from "@/utils/icons";

export interface RatingProps {
  rate: number;
  count?: number;
}

const Rating: React.FC<RatingProps> = ({ rate = 0, count = 0 }) => {
  const showNA = rate === 0 || Number.isNaN(rate);

  return (
    <div className="flex items-center gap-1 font-semibold text-warning-500">
      <Star />
      <p>
        {showNA ? "N/A" : rate.toFixed(1)}
        {!showNA && count > 0 ? ` (${formatNumber(count)})` : ""}
      </p>
    </div>
  );
};

export default Rating;
