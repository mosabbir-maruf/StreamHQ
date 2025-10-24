import { cn } from "@/utils/helpers";
import { Tooltip } from "@heroui/react";
import Link from "next/link";

interface ActionButtonProps {
  label: string;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  tooltip?: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  href = "",
  children,
  onClick,
  tooltip,
  disabled,
}) => {
  const Button = (
    <Tooltip content={tooltip} isDisabled={disabled || !tooltip} showArrow placement="bottom">
      <button
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "group relative flex items-center justify-center",
          "h-10 w-10 rounded-lg",
          "bg-white/5 backdrop-blur-md border border-white/10",
          "transition-all duration-200",
          "[&>svg]:w-5 [&>svg]:h-5 [&>svg]:transition-transform [&>svg]:duration-200",
          {
            "hover:bg-white/15 hover:border-white/20 active:scale-95 hover:[&>svg]:scale-110": !disabled,
            "cursor-not-allowed opacity-40": disabled,
          }
        )}
      >
        {children}
      </button>
    </Tooltip>
  );

  return href ? (
    <Link href={href} className="flex items-center">
      {Button}
    </Link>
  ) : (
    Button
  );
};

export default ActionButton;
