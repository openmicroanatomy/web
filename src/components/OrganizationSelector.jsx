import React, { useEffect, useState } from "react";

function OrganizationSelector({ OnOrganizationChange }) {
    const [ organizations, setOrganizations ] = useState([]);
    const [ error, setError ] = useState(null);

    useEffect(() => {
        fetch("http://yli-hallila.fi:7777/api/v0/organizations")
            .then(res => res.json())
            .then(
                (result) => {
                    setOrganizations(result);
                },
                (error) => {
                    setError(error);
                }
            )
    }, []);

    if (error) {
        return "Error with OrganizationSelector";
    }

    return (
        <div id="OrganizationSelector">
            <p class="text-xl">Select organization</p>

            <select name="organization" onChange={ e => OnOrganizationChange(e.target.value) }>
                <option>Select ...</option>

                {organizations.map(organization => (
                    <option value={organization.id} key={organization.id}>{organization.name}</option>
                ))}
            </select>
        </div>
    );
};

export default OrganizationSelector;
