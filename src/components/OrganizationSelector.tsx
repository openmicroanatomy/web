import { fetchOrganizations } from "lib/api";
import { hostState } from "lib/atoms";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Organization } from "types";
import Select from 'react-select'

interface OrganizationSelectorProps {
    organization: Organization | null;
    onOrganizationChange: (organization: Organization | null) => void;
}

function OrganizationSelector({ organization, onOrganizationChange }: OrganizationSelectorProps) {
    const host = useRecoilValue(hostState);
    const [organizations, setOrganizations] = useState<Organization[]>([]);

    useEffect(() => {
        if (!host) {
            return;
        }

        fetchOrganizations()
            .then((organizations: Organization[]) => {
                setOrganizations(organizations);
            })
            .catch(e => {
                setOrganizations([]);
                console.error(e);
            });
    }, [host]);

    if (!host) {
        return <p className="font-bold">No host selected</p>;
    }

    if (organizations.length == 0) {
        return <p className="font-bold">No organizations available</p>;
    }

    return (
        <div>
            <p className="text-xl italic">Organization</p>

            <Select 
                placeholder="Select organization ..."
                options={organizations}
                getOptionLabel={org => org.name}
                getOptionValue={org => org.id}
                defaultValue={organization}
                onChange={e => onOrganizationChange(e)}
                menuPortalTarget={document.querySelector("body")}  />
        </div>
    );
}

export default OrganizationSelector;
