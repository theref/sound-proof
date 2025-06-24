
import { useENS } from "@/hooks/useENS";
import { useNavigate } from "react-router-dom";

interface AddressDisplayProps {
  address: string;
  className?: string;
  clickable?: boolean;
}

export const AddressDisplay = ({ address, className = "", clickable = false }: AddressDisplayProps) => {
  const { ensName, isLoading } = useENS(address);
  const navigate = useNavigate();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleClick = () => {
    if (clickable) {
      navigate(`/profile/${address}`);
    }
  };

  const displayName = ensName || truncateAddress(address);

  if (isLoading) {
    return (
      <span className={className}>
        {truncateAddress(address)}
      </span>
    );
  }

  if (clickable) {
    return (
      <span 
        className={`${className} cursor-pointer hover:underline`} 
        title={address}
        onClick={handleClick}
      >
        {displayName}
      </span>
    );
  }

  return (
    <span className={className} title={address}>
      {displayName}
    </span>
  );
};
