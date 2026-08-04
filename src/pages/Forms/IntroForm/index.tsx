import { useEffect, useRef, useState } from "react";
import PageMeta from "../../../components/common/PageMeta.tsx";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb.tsx";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { resetBusinessEntityCheck } from "../../../slices/BusinessEntitySlice";
import OibForm from "./OibForm.tsx";
import BusinessCard from "./BusinessCard.tsx";
import BillTypeCard from "./BillTypeCard.tsx";
import type { BillType } from "./BillTypeCard.tsx";
import B2BBillFormCard from "./B2BBillFormCard.tsx";
import B2CBillFormCard from "./B2CBillFormCard.tsx";
import B2BReportFormCard from "./B2BReportFormCard.tsx";

export default function IntroForm() {
    const dispatch = useAppDispatch();
    const business = useAppSelector((state) => state.businessEntity.checkResult);
    const [billType, setBillType] = useState<BillType | null>(null);
    const billTypeRef = useRef<HTMLDivElement>(null);
    const billFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            dispatch(resetBusinessEntityCheck());
        };
    }, [dispatch]);

    useEffect(() => {
        if (business) {
            billTypeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [business]);

    useEffect(() => {
        if (billType) {
            billFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [billType]);

    const handleResetAll = () => {
        dispatch(resetBusinessEntityCheck());
        setBillType(null);
    };

    return <div>
        <PageMeta
            title="Novi račun | Tehnomodus administracija"
            description="Obrazac za provjeru OIB-a."
        />
        <PageBreadcrumb pageTitle="Novi račun" />
        <div className="flex justify-center">
            <div className="w-full max-w-md space-y-6">
                <OibForm onReset={handleResetAll} />
                <BusinessCard />
                <div ref={billTypeRef}>
                    <BillTypeCard
                        key={business?.amsCheckResponse.identifier ?? "none"}
                        onNext={(bt) => setBillType(bt)}
                    />
                </div>
            </div>
        </div>
        {billType && (
            <div ref={billFormRef} className="flex justify-center mt-6">
                <div className="w-full max-w-2xl">
                    {billType === "B2C_BILL" ? (
                        <B2CBillFormCard onCancel={handleResetAll} />
                    ) : billType === "B2B_REPORT" ? (
                        <B2BReportFormCard onCancel={handleResetAll} />
                    ) : (
                        <B2BBillFormCard onCancel={handleResetAll} />
                    )}
                </div>
            </div>
        )}
    </div>
}
