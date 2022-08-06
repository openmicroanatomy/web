import HostSelector from "components/HostSelector";
import OrganizationSelector from "components/OrganizationSelector";
import ProjectSelector from "components/ProjectSelector";
import ProjectView from "components/ProjectView";
import { hostState } from "lib/atoms";
import Constants from "lib/constants";
import { getValue, setValue } from "lib/localStorage";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useRecoilState } from "recoil";
import "tailwindcss/tailwind.css";
import { Organization } from "types";
import validator from "validator";

const Home = () => {
    const [host, setHost] = useRecoilState(hostState);
    const [organization, setOrganization] = useState<Organization | null>(null)
    const [projectId, setProjectId] = useState("");
    const query = useLocation().search;

    useEffect(() => {
        const hostHelper = async () => {
            // Read URL query first
            if (query) {
                const queryUrl = new URLSearchParams(query).get("host");

                if (queryUrl && validator.isURL(queryUrl)) {
                    const queryHost = { name: queryUrl, id: "query-host", host: queryUrl, img: "" };
                    setHost(queryHost);
                    setValue(Constants.LOCALSTORAGE_HOST_KEY, queryHost);
                }
            }

            // Read from browser's local storage
            const cachedHost = getValue(Constants.LOCALSTORAGE_HOST_KEY);
            if (cachedHost) {
                setHost(cachedHost);
            }
        };

        hostHelper();
    }, []);

    const onOrganizationChange = (newOrganization: Organization | null) => {
        setOrganization(newOrganization);
    };

    const onProjectChange = (newProjectId: string) => {
        setProjectId(newProjectId);
    };

    if (projectId) {
        return <ProjectView projectId={projectId} onProjectChange={onProjectChange} />
    }

    return (
        <div className="mx-auto my-12 w-96 space-y-12 p-4 border rounded shadow-md bg-white overflow-y-auto scrollbar flex flex-col">
            <header className="mx-auto w-72 mt-4">
                <h1 className="text-3xl">QuPath Edu Cloud</h1>
            </header>

            <HostSelector />

            {host && 
                <OrganizationSelector organization={organization} onOrganizationChange={onOrganizationChange} />
            }

            {(host && organization) && 
                <ProjectSelector organizationId={organization?.id} onProjectChange={onProjectChange} />
            }
        </div>
    );
};

export default Home;
