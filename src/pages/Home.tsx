import HostSelector from "components/HostSelector";
import OrganizationSelector from "components/OrganizationSelector";
import ProjectSelector from "components/ProjectSelector";
import ProjectView from "components/ProjectView";
import { currentSlideState, hostState, slideTourState } from "lib/atoms";
import Constants from "lib/constants";
import { getValue } from "lib/localStorage";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Host, Organization, Subject, Workspace } from "types";
import { fetchHosts, fetchOrganizations, fetchWorkspaces } from "lib/api";
import { toast } from "react-toastify";

const Home = () => {
    /* State shared to child components */
    const [hosts, setHosts] = useState<Host[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

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
        setSubjects([]);
        setWorkspaces([]);
        setOrganizations([]);

        if (!host) {
            return;
        }

        fetchOrganizations()
            .then(organizations => setOrganizations(organizations))
            .catch(e => {
                setOrganizations([]);
                toast.error("Error while loading organizations")
                console.error(e);
            });

        fetchWorkspaces()
            .then(workspaces => setWorkspaces(workspaces))
            .catch(e => {
                setWorkspaces([]);
                toast.error("Error while loading workspaces");
                console.error(e);
            });
    }, [host]);

    useEffect(() => {
        if (!organization) {
            setSubjects([]);
            return;
        }

        const workspace = workspaces.find(workspace => workspace.owner.id === organization.id);

        if (workspace) {
            const sorted = workspace.subjects.sort((a, b) => a.name.localeCompare(b.name));
            setSubjects(sorted);
        } else {
            setSubjects([]);
        }
    }, [organization]);

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
        <div className="mx-auto lg:my-12 w-96 space-y-12 p-4 lg:border lg:rounded lg:shadow-md lg:bg-white overflow-y-auto scrollbar flex flex-col">
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
