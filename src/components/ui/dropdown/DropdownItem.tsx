import type {MouseEvent, ReactNode} from "react";
import {Link} from "react-router";

interface DropdownItemProps {
  to?: string;
  onClick?: () => void;
  onItemClick?: () => void;
  className?: string;
  children: ReactNode;
}

export function DropdownItem({
  to,
  onClick,
  onItemClick,
  className = "",
  children,
}: DropdownItemProps) {
  const handleClick = (event: MouseEvent) => {
    if (!to) event.preventDefault();
    onClick?.();
    onItemClick?.();
  };

  if (to) {
    return (
      <Link to={to} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}