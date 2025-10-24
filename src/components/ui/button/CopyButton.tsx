"use client";

import { addToast } from "@heroui/react";
import IconButton, { IconButtonProps } from "./IconButton";
import { useClipboard } from "@mantine/hooks";
import { Check, Copy } from "@/utils/icons";
import { useCallback } from "react";

interface CopyButtonProps {
  text: string;
  timeout?: number;
  label?: string;
  copiedLabel?: string;
  onCopied?: () => void;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  timeout = 2000,
  label,
  copiedLabel = "Copied to clipboard!",
  onCopied,
  className,
}) => {
  const { copy, copied } = useClipboard({ timeout });

  const handleCopy = useCallback(() => {
    copy(text);
    addToast({ title: copiedLabel, color: "primary" });
    onCopied?.();
  }, [text, copiedLabel]);

  const buttonProps: IconButtonProps = {
    onClick: handleCopy,
    isDisabled: copied,
    radius: "full",
    icon: copied ? <Check size={20} /> : <Copy size={20} />,
    variant: "flat",
    size: "md",
    className: `h-8 w-8 min-w-8 bg-transparent border-transparent hover:bg-white/5 ${
      className || ""
    }`,
  };

  if (!label) {
    return <IconButton {...buttonProps} />;
  }

  return (
    <button onClick={handleCopy} disabled={copied} className="flex items-center gap-2">
      <IconButton as="div" {...buttonProps} />
      <p className="text-medium">{label}</p>
    </button>
  );
};

export default CopyButton;
