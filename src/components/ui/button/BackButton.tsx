import IconButton from "./IconButton";
import { FaChevronLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export interface BackButtonProps {
  href?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ href = "/" }) => {
  const router = useRouter();
  
  // If href is undefined, use browser's back functionality
  if (href === undefined) {
    return (
      <IconButton 
        icon={<FaChevronLeft size={20} />} 
        onClick={() => router.back()} 
      />
    );
  }
  
  return <IconButton icon={<FaChevronLeft size={20} />} href={href} />;
};

export default BackButton;
