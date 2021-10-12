import React, { useEffect, useState } from "react";
import { fetchApi } from "../lib/api";
import { Organization } from "../types";

interface OrganizationSelectorProps {
    onOrganizationChange: (newProject: string) => void;
}

function OrganizationSelector({ onOrganizationChange }: OrganizationSelectorProps) {
    const [organizations, setOrganizations] = useState([]);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const apiHelper = async () => {
            const result = await fetchApi("/organizations");
            setOrganizations(result);
        };

        try {
            apiHelper();
        } catch (e) {
            setOrganizations([]);
            if (e instanceof Error) {
                setError(e);
            }
        }
    }, []);

    if (error) {
        return <>"Error with OrganizationSelector"</>;
    }

    return (
        <div id="OrganizationSelector">
            <p className="text-xl">Select organization</p>

            <select name="organization" onChange={(e) => onOrganizationChange(e.target.value)}>
                <option>Select ...</option>

                {organizations.map((organization: Organization) => (
                    <option value={organization.id} key={organization.id}>
                        {organization.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default OrganizationSelector;
