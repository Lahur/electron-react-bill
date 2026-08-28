import {useEffect} from "react";
import {useAppSelector} from "../app/hooks";

export function useThemeSync() {
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    window.localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
}