import { hostState } from "lib/atoms";
import { useRecoilValue } from "recoil";
import { EduOrganization, EduWorkspace } from "types";
import Select from 'react-select'
import { useMemo } from "react";

type Props = {
    currentOrganization: EduOrganization | null;
    organizations?: EduOrganization[];
    workspaces?: EduWorkspace[];
    onOrganizationChange: (organization: EduOrganization | null) => void;
}

export default function OrganizationSelector({ currentOrganization, organizations, workspaces, onOrganizationChange }: Props) {
    const host = useRecoilValue(hostState);

    // Remove organizations with zero workspaces.
    const filteredOrganizations = useMemo(() => {
        const organizationsWithWorkspaces = workspaces?.map(workspace => workspace.owner.id) || [];
        return organizations?.filter(organization => organizationsWithWorkspaces.includes(organization.id)) || [];
    }, [organizations, workspaces]);

    if (!host) {
        return <p className="font-bold text-center">No host selected</p>;
    }

    if (!organizations) {
        return <p className="font-bold text-center">Loading ...</p>;
    }

    if (organizations.length == 0) {
        return <p className="font-bold text-center">No organizations available</p>;
    }

    return (
        <Select
            placeholder="Select organization ..."
            options={filteredOrganizations}
            isSearchable={false}
            getOptionLabel={org => org.name}
            getOptionValue={org => org.id}
            defaultValue={currentOrganization}
            onChange={e => onOrganizationChange(e)}
            menuPortalTarget={document.querySelector("body")}  />
    );
}
