import { useRef, useState } from "react";
import type { SubmitEvent } from "react";
import ComponentCard from "../../../components/common/ComponentCard.tsx";
import Label from "../../../components/form/Label.tsx";
import Input from "../../../components/form/input/InputField.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { checkBusinessEntityByOib } from "../../../slices/BusinessEntitySlice";

function isValidOib(value: string): boolean {
    if (!/^\d{11}$/.test(value)) return false;

    let remainder = 10;
    for (let i = 0; i < 10; i++) {
        remainder = (remainder + Number(value[i])) % 10;
        if (remainder === 0) remainder = 10;
        remainder = (remainder * 2) % 11;
    }

    let controlDigit = 11 - remainder;
    if (controlDigit === 10) controlDigit = 0;

    return controlDigit === Number(value[10]);
}

export default function OibForm({ onReset }: { onReset: () => void }) {
    const dispatch = useAppDispatch();
    const [error, setError] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const checkResult = useAppSelector((state) => state.businessEntity.checkResult);

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const oib = new FormData(e.currentTarget).get("oib") as string;
        if (!isValidOib(oib)) {
            setError(true);
            return;
        }
        setError(false);
        dispatch(checkBusinessEntityByOib(oib));
    };

    const handleReset = () => {
        onReset();
        formRef.current?.reset();
        setError(false);
    };

    return <ComponentCard title="Provjera OIB-a">
        <form ref={formRef} onSubmit={handleSubmit}>
        <div className="space-y-6">
            <div>
                <Label htmlFor="oib">OIB</Label>
                <Input
                    type="text"
                    id="oib"
                    name="oib"
                    error={error}
                    hint={error ? "Neispravan OIB." : ""}
                    disabled={!!checkResult}
                />
            </div>
            <div className="flex items-center gap-3">
                <Button type="submit" size="sm" variant="primary" disabled={!!checkResult}>
                    Provjeri
                </Button>
                {checkResult && (
                    <Button type="button" size="sm" variant="outline" onClick={handleReset}>
                        Poništi
                    </Button>
                )}
            </div>
        </div>
        </form>
    </ComponentCard>
}
