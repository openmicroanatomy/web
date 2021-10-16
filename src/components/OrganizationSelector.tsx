import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilValue } from "recoil";
import { fetchOrganizations } from "lib/api";
import { hostState } from "lib/atoms";
import { Organization } from "types";

interface OrganizationSelectorProps {
    onOrganizationChange: (newProject: string) => void;
}

function OrganizationSelector({ onOrganizationChange }: OrganizationSelectorProps) {
    const host = useRecoilValue(hostState);
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
        if (!host) {
            return;
        }

        const apiHelper = async () => {
            try {
                const result = await fetchOrganizations();
                setOrganizations(result);
            } catch (e) {
                if (e instanceof Error) {
                    toast.error(e.message);
                }
            }
        };

        apiHelper();
    }, [host]);

    if (!host) {
        return (
            <div id="OrganizationSelector">
                <p className="font-bold">No host selected</p>
            </div>
        );
    }

    return (
        <div id="OrganizationSelector">
            <p className="text-xl">Organization</p>

            {organizations.length > 0 && (
                <select className="w-full" name="organization" onChange={(e) => onOrganizationChange(e.target.value)} defaultValue="">
                    <option disabled value="">Select organization ...</option>

                    {organizations.map((organization: Organization) => (
                        <option value={organization.id} key={organization.id}>
                            {organization.name}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}

export default OrganizationSelector;
