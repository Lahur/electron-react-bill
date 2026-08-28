import ComponentCard from "../../../components/common/ComponentCard.tsx";
import {useAppSelector} from "../../../app/hooks";

export default function BusinessCard() {
    const business = useAppSelector((state) => state.businessEntity.checkResult);
    const entity = business?.businessEntity;

    if (!business) {
        return (
            <ComponentCard title="Podaci o poslovnom subjektu">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Poslovni subjekt nije pronađen. Provjerite OIB iznad.
                </p>
            </ComponentCard>
        );
    }

    if (!entity) {
        return (
            <ComponentCard title="Podaci o poslovnom subjektu">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nema podataka o poslovnom subjektu.
                </p>
            </ComponentCard>
        );
    }

    return (
        <ComponentCard title="Podaci o poslovnom subjektu">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
                <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Naziv
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {entity.name}
                    </p>
                </div>

                <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        OIB
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {entity.oib}
                    </p>
                </div>

                <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Adresa
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {entity.headquatersAddress}, {entity.headquatersCity}
                    </p>
                </div>

                <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                        Pravni oblik
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {entity.legalForm}
                    </p>
                </div>
            </div>
        </ComponentCard>
    );
}
