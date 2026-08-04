import { useState } from "react";
import ComponentCard from "../../../components/common/ComponentCard.tsx";
import Checkbox from "../../../components/form/input/Checkbox.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import { useAppSelector } from "../../../app/hooks";

export type BillType = "B2B_BILL" | "B2C_BILL" | "B2B_REPORT";

const billTypeLabels: Record<BillType, string> = {
    B2B_BILL: "B2B račun",
    B2C_BILL: "B2C račun",
    B2B_REPORT: "B2B prijava",
};

export default function BillTypeCard({ onNext }: { onNext: (billType: BillType) => void }) {
    const business = useAppSelector((state) => state.businessEntity.checkResult);
    const publishedOnAms = business?.amsCheckResponse.publishedOnAms ?? false;
    const [billType, setBillType] = useState<BillType>(publishedOnAms ? "B2B_BILL" : "B2C_BILL");

    if (!business) {
        return null;
    }

    return (
        <ComponentCard title="Vrsta računa">
            <div className="space-y-6">
                <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Vrsta računa
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {billTypeLabels[billType]}
                    </p>
                </div>
                <div className="flex items-center">
                    {!publishedOnAms && (
                        <Checkbox
                            checked={billType === "B2B_REPORT"}
                            onChange={(checked) => setBillType(checked ? "B2B_REPORT" : "B2C_BILL")}
                            label="Prijava"
                        />
                    )}
                    <Button size="sm" variant="primary" className="ml-auto" onClick={() => onNext(billType)}>
                        Dalje
                    </Button>
                </div>
            </div>
        </ComponentCard>
    );
}
