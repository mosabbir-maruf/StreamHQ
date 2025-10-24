import { Tooltip, Button, ButtonProps, TooltipProps } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";

export interface IconButtonProps extends Omit<ButtonProps, "isIconOnly"> {
  icon: string | React.ReactNode;
  tooltip?: string;
  iconSize?: number;
  tooltipProps?: Omit<TooltipProps, "isDisabled" | "content" | "children">;
}

const IconButton: React.FC<IconButtonProps> = ({
  as,
  icon,
  tooltip,
  iconSize = 24,
  tooltipProps,
  className,
  ...props
}) => {
  return (
    <Tooltip isDisabled={!tooltip} content={tooltip} {...tooltipProps}>
      <Button 
        as={as || (props.href ? Link : "button")} 
        isIconOnly 
        variant="flat"
        className={`
          bg-white/5 backdrop-blur-md border border-white/10
          hover:bg-white/15 hover:border-white/20
          active:scale-95
          transition-all duration-200
          h-10 w-10 min-w-10
          ${className || ''}
        `}
        {...props}
      >
        {typeof icon === "string" ? <Icon icon={icon} fontSize={iconSize} /> : icon}
      </Button>
    </Tooltip>
  );
};

export default IconButton;
