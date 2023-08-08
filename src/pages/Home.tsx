import HostSelector from "components/HostSelector";
import OrganizationSelector from "components/OrganizationSelector";
import ProjectSelector from "components/ProjectSelector";
import ProjectView from "components/ProjectView";
import { currentSlideState, hostState, slideTourState } from "lib/atoms";
import Constants from "lib/constants";
import { getValue } from "lib/localStorage";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Host, Organization, Workspace } from "types";
import { fetchHosts, fetchOrganizations, fetchWorkspaces } from "lib/api";
import { toast } from "react-toastify";

const Home = () => {
    /* State shared to child components */
    const [hosts, setHosts] = useState<Host[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>();
    const [workspaces, setWorkspaces] = useState<Workspace[]>();

    const [host, setHost] = useRecoilState(hostState);
    const [organization, setOrganization] = useState<Organization | null>(null)
    const [projectId, setProjectId] = useState("");

    const setSlide = useSetRecoilState(currentSlideState);
    const setSlideTour = useSetRecoilState(slideTourState);

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
        setWorkspaces(undefined);
        setOrganizations(undefined);

        if (!host) {
            return;
        }

        const fetchData = async () => {
            const [organizations, workspaces] = await Promise.all([fetchOrganizations(), fetchWorkspaces()]);

            setOrganizations(organizations);
            setWorkspaces(workspaces);
        }

        fetchData()
            .catch(e => {
                toast.error("Error while loading, please retry ...");
                setWorkspaces([]);
                setOrganizations([]);
                console.error(e)
            });
    }, [host]);

    const onOrganizationChange = (newOrganization: Organization | null) => {
        setOrganization(newOrganization);
    };

    const onProjectChange = (newProjectId: string) => {
        setProjectId(newProjectId);
        setSlide(null);
        setSlideTour({ active: false, index: 0, entries: [] })
    };

    if (projectId) {
        return <ProjectView projectId={projectId} onProjectChange={onProjectChange} />
    }

    return (
        <div className="mx-auto lg:my-12 w-full max-w-sm space-y-12 p-4 lg:border lg:rounded lg:shadow-md lg:bg-white overflow-y-auto scrollbar flex flex-col">
            <header className="mx-auto mt-4">
                <h1 className="text-2xl sm:text-4xl">OpenMicroanatomy</h1>
            </header>

            <HostSelector hosts={hosts} />

            {host && 
                <OrganizationSelector
                    currentOrganization={organization}
                    organizations={organizations}
                    workspaces={workspaces}
                    onOrganizationChange={onOrganizationChange}
                />
            }

            {(host && organization) && 
                <ProjectSelector
                    workspaces={workspaces}
                    organization={organization}
                    onProjectChange={onProjectChange}
                />
            }
        </div>
    );
};

export default Home;
