import { hostState } from "lib/atoms";
import { useRecoilValue } from "recoil";
import { Organization } from "types";
import Select from 'react-select'

interface OrganizationSelectorProps {
    currentOrganization: Organization | null;
    organizations: Organization[];
    onOrganizationChange: (organization: Organization | null) => void;
}

function OrganizationSelector({ currentOrganization, organizations, onOrganizationChange }: OrganizationSelectorProps) {
    const host = useRecoilValue(hostState);

    if (!host) {
        return <p className="font-bold text-center">No host selected</p>;
    }

    if (organizations.length == 0) {
        return <p className="font-bold text-center">No organizations available</p>;
    }

    return (
        <Select
            placeholder="Select organization ..."
            options={organizations}
            isSearchable={false}
            getOptionLabel={org => org.name}
            getOptionValue={org => org.id}
            defaultValue={currentOrganization}
            onChange={e => onOrganizationChange(e)}
            menuPortalTarget={document.querySelector("body")}  />
    );
}

export default OrganizationSelector;
