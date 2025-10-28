import Select from 'react-select'
import { useMemo } from "react";
import { useStore } from "../lib/StateStore";
import { EduOrganization } from "../types";
import { setValue } from "../lib/localStorage";
import Constants from "../lib/constants";

export default function OrganizationSelector() {
    const [ server, organizations, workspaces, organization, setOrganization ] = useStore(state => [
      state.server, state.organizations, state.workspaces, state.organization, state.setOrganization
    ]);

    function handleChangeOrganization(newOrganization: EduOrganization | null) {
        setOrganization(newOrganization);
        setValue(Constants.PREVIOUS_ORGANIZATION_KEY, newOrganization);
    }

    // Remove organizations with zero workspaces.

    const filteredOrganizations = useMemo(() => {
        if (!server) return [];

        const organizationsWithWorkspaces = workspaces?.map(workspace => workspace.owner.id) || [];

        return organizations.filter(organization => organizationsWithWorkspaces.includes(organization.id)) || [];
    }, [server]);

    if (!server) {
        return <p className="font-bold text-center">No host selected</p>;
    }

    if (filteredOrganizations.length == 0) {
        return <p className="font-bold text-center">No organizations available</p>;
    }

    return (
        <Select
            placeholder="Select organization ..."
            options={filteredOrganizations}
            isSearchable={false}
            getOptionLabel={org => org.name}
            getOptionValue={org => org.id}
            defaultValue={organization}
            onChange={org => handleChangeOrganization(org)}
            menuPortalTarget={document.querySelector("dialog")}
            styles={{ menuPortal: (base) => ({ ...base, position: "fixed" })}}
        />
    );
}
