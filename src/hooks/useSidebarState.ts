import {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {
    setMobileSidebarOpen,
    setSidebarHovered,
    toggleMobileSidebar,
    toggleSidebar,
    toggleSubmenu,
} from "../features/ui/uiSlice";

export function useSidebarState() {
  const dispatch = useAppDispatch();
  const { isSidebarExpanded, isMobileSidebarOpen, isSidebarHovered, openSubmenuIndex } =
    useAppSelector((state) => state.ui);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        dispatch(setMobileSidebarOpen(false));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  return {
    isExpanded: isMobile ? false : isSidebarExpanded,
    isMobileOpen: isMobileSidebarOpen,
    isHovered: isSidebarHovered,
    openSubmenuIndex,
    toggleSidebar: () => dispatch(toggleSidebar()),
    toggleMobileSidebar: () => dispatch(toggleMobileSidebar()),
    setHovered: (hovered: boolean) => dispatch(setSidebarHovered(hovered)),
    toggleSubmenu: (index: number) => dispatch(toggleSubmenu(index)),
  };
}
