import {type ReactNode, useEffect, useRef, useState} from "react";
import {Link, useLocation} from "react-router";
import {BoxIconLine, ChevronDownIcon, DocsIcon, GridIcon, HorizontaLDots} from "../icons";
import {useSidebarState} from "../hooks/useSidebarState";

type NavItem = {
  name: string;
  icon: ReactNode;
  subItems: { name: string; path: string }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Nadzorna ploča",
    subItems: [{ name: "Administracija", path: "/" }],
  },
  {
    icon: <BoxIconLine />,
    name: "Računi",
    subItems: [
      { name: "Novi", path: "/bills/new" },
      { name: "B2B Izlazni računi", path: "/bills/outgoing/b2b" },
      { name: "B2C Izlazni računi", path: "/bills/outgoing/b2c" },
      { name: "B2B Prijava računa", path: "/bills/outgoing/b2b-report" },
      { name: "Ulazni računi", path: "/bills/ingoing" },
    ],
  },
  {
    icon: <DocsIcon />,
    name: "Bankovni izvodi",
    subItems: [{ name: "Pregled", path: "/bills/bank-statements" }],
  },
  {
    icon: <DocsIcon />,
    name: "POS transakcije",
    subItems: [{ name: "Pregled", path: "/bills/pos-transactions" }],
  },
  {
    icon: <DocsIcon />,
    name: "Blagajnički izvještaji",
    subItems: [
      { name: "Pregled", path: "/bills/accounts-statements" },
      { name: "Stanje blagajne", path: "/bills/cash-withdrawal-balances" },
    ],
  },
];

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setHovered, openSubmenuIndex, toggleSubmenu } =
    useSidebarState();
  const location = useLocation();

  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (openSubmenuIndex !== null && subMenuRefs.current[openSubmenuIndex]) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [openSubmenuIndex]: subMenuRefs.current[openSubmenuIndex]?.scrollHeight ?? 0,
      }));
    }
  }, [openSubmenuIndex]);

  const showLabels = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {showLabels ? (
            <>
              <img className="dark:hidden" src="./images/logo/logo.svg" alt="Logo" width={150} height={40} />
              <img className="hidden dark:block" src="./images/logo/logo-dark.svg" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <img src="./images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showLabels ? "Izbornik" : <HorizontaLDots className="size-6" />}
              </h2>
              <ul className="flex flex-col gap-4">
                {navItems.map((nav, index) => (
                  <li key={nav.name}>
                    <button
                      onClick={() => toggleSubmenu(index)}
                      className={`menu-item group cursor-pointer ${
                        openSubmenuIndex === index ? "menu-item-active" : "menu-item-inactive"
                      } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          openSubmenuIndex === index ? "menu-item-icon-active" : "menu-item-icon-inactive"
                        }`}
                      >
                        {nav.icon}
                      </span>
                      {showLabels && <span className="menu-item-text">{nav.name}</span>}
                      {showLabels && (
                        <ChevronDownIcon
                          className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                            openSubmenuIndex === index ? "rotate-180 text-brand-500" : ""
                          }`}
                        />
                      )}
                    </button>

                    {showLabels && (
                      <div
                        ref={(el) => {
                          subMenuRefs.current[index] = el;
                        }}
                        className="overflow-hidden transition-all duration-300"
                        style={{
                          height: openSubmenuIndex === index ? `${subMenuHeight[index] ?? 0}px` : "0px",
                        }}
                      >
                        <ul className="mt-2 space-y-1 ml-9">
                          {nav.subItems.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                to={subItem.path}
                                className={`menu-dropdown-item ${
                                  isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                                }`}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}