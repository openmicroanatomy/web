import HostSelector from "components/HostSelector";
import OrganizationSelector from "components/OrganizationSelector";
import ProjectSelector from "components/ProjectSelector";
import ProjectView from "components/ProjectView";
import { hostState } from "lib/atoms";
import Constants from "lib/constants";
import { getValue } from "lib/localStorage";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useRecoilState } from "recoil";
import "tailwindcss/tailwind.css";
import { Host, Organization, Subject, Workspace } from "types";
import { fetchHosts, fetchOrganizations, fetchWorkspaces } from "lib/api";

const Home = () => {
    /* State shared to child components */
    const [hosts, setHosts] = useState<Host[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const [host, setHost] = useRecoilState(hostState);
    const [organization, setOrganization] = useState<Organization | null>(null)
    const [projectId, setProjectId] = useState("");

    useEffect(() => {
        (async () => {
            // Read from browser's local storage
            const cachedHost = getValue(Constants.LOCALSTORAGE_HOST_KEY);

            if (cachedHost) {
                setHost(cachedHost);
            }
        })();

        fetchHosts()
            .then(hosts => setHosts(hosts))
            .catch(e => {
                console.error(e);
            });
    }, []);

    useEffect(() => {
        setOrganization(null);
        setProjectId("");
        setSubjects([]);
        setOrganizations([]);

        if (!host) {
            return;
        }

        fetchOrganizations()
            .then(organizations => setOrganizations(organizations))
            .catch(e => {
                setOrganizations([]);
                console.error(e);
            });
    }, [host]);

    useEffect(() => {
        if (!organization) {
            setSubjects([]);
            return;
        }

        fetchWorkspaces()
            .then((workspaces: Workspace[]) => {
                const workspace = workspaces.find(workspace => workspace.owner.id === organization.id);

                if (workspace) {
                    setSubjects(workspace.subjects.sort((a, b) => a.name.localeCompare(b.name)));
                }
            })
            .catch(() => {
                setSubjects([]);
            });
    }, [organization]);

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
        <div className="mx-auto my-4 lg:my-12 w-96 space-y-12 p-4 border rounded shadow-md bg-white overflow-y-auto scrollbar flex flex-col">
            <header className="mx-auto w-72 mt-4">
                <h1 className="text-3xl">OpenMicroanatomy</h1>
            </header>

            <HostSelector hosts={hosts} />

            {host && 
                <OrganizationSelector
                    currentOrganization={organization}
                    organizations={organizations}
                    onOrganizationChange={onOrganizationChange}
                />
            }

            {(host && organization) && 
                <ProjectSelector
                    subjects={subjects}
                    onProjectChange={onProjectChange}
                />
            }
        </div>
    );
};

export default Home;
