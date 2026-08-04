import { useEffect, useRef } from "react";
import { HashRouter, Route, Routes } from "react-router";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { loginStarted, loginSucceeded, loginFailed } from "./features/auth/authSlice";
import { ScrollToTop } from "./components/common/ScrollToTop";
import LoadingSpinner from "./components/common/LoadingSpinner";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import B2BOutgoingBills from "./pages/Bills/B2BOutgoingBills";
import B2COugoingBills from "./pages/Bills/B2COugoingBills";
import B2BReportBills from "./pages/Bills/B2BReportBills";
import IngoingBills from "./pages/Bills/IngoingBills";
import BankStatements from "./pages/Bills/BankStatements";
import BillInfo from "./pages/Bills/BillInfo";
import IntroForm from "./pages/Forms/IntroForm";
import { useThemeSync } from "./hooks/useThemeSync";

export default function App() {
  useThemeSync();

  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);
  const loginAttempted = useRef(false);

  useEffect(() => {
    if (loginAttempted.current) return;
    loginAttempted.current = true;

    dispatch(loginStarted());
    window.electron.auth
      .login()
      .then((user) => dispatch(loginSucceeded(user)))
      .catch((err) => dispatch(loginFailed(err instanceof Error ? err.message : "Login failed")));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return error ? (
      <div className="flex h-screen items-center justify-center text-error-500">{error}</div>
    ) : null;
  }

  return (
    <HashRouter>
      <ScrollToTop />
      <LoadingSpinner />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/bills/outgoing/b2b" element={<B2BOutgoingBills />} />
          <Route path="/bills/outgoing/b2c" element={<B2COugoingBills />} />
          <Route path="/bills/outgoing/b2b-report" element={<B2BReportBills />} />
          <Route path="/bills/ingoing" element={<IngoingBills />} />
          <Route path="/bills/bank-statements" element={<BankStatements />} />
          <Route path="/bills/new" element={<IntroForm />} />
          <Route path="/bills/:billType/:id" element={<BillInfo />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}