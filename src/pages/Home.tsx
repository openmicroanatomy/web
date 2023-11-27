import HostSelector from "components/HostSelector";
import OrganizationSelector from "components/OrganizationSelector";
import ProjectSelector from "components/ProjectSelector";
import ProjectView from "components/ProjectView";
import { currentSlideState, hostState, selectedAnnotationState, slideTourState } from "lib/atoms";
import Constants from "lib/constants";
import { getValue } from "lib/localStorage";
import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { EduHost, EduOrganization, EduWorkspace } from "types";
import { fetchHosts, fetchOrganizations, fetchWorkspaces } from "lib/api";
import { toast } from "react-toastify";

export default function Home() {
    /* State shared to child components */
    const [hosts, setHosts] = useState<EduHost[]>([]);
    const [organizations, setOrganizations] = useState<EduOrganization[]>();
    const [workspaces, setWorkspaces] = useState<EduWorkspace[]>();

    const [host, setHost] = useRecoilState(hostState);
    const [organization, setOrganization] = useState<EduOrganization | null>(null)
    const [projectId, setProjectId] = useState("");

    const setSelectedAnnotation = useSetRecoilState(selectedAnnotationState);
    const setSlide = useSetRecoilState(currentSlideState);
    const setSlideTour = useSetRecoilState(slideTourState);

    useEffect(() => {
        (async () => {
            // Read from browser's local storage the previous host
            const cachedHost = getValue(Constants.LOCALSTORAGE_HOST_KEY);

            if (cachedHost) {
                setHost(cachedHost);
            }

            try {
                setHosts(await fetchHosts());
            } catch (err) {
                toast.error("Error while loading hosts, please retry ...")
                console.error("Error while fetching hosts")
            }
        })();
    }, []);

    useEffect(() => {
        setOrganization(null);
        setWorkspaces([]);
        setOrganizations([]);

        if (!host) {
            return;
        }

        (async () => {
            try {
                const [organizations, workspaces] = await Promise.all([fetchOrganizations(), fetchWorkspaces()]);

                setOrganizations(organizations);
                setWorkspaces(workspaces);
            } catch (err) {
                setWorkspaces([]);
                setOrganizations([]);
                toast.error("Error while loading, please retry ...");
                console.error("Error while loading organizations / workspaces", err);
            }
        })();
    }, [host]);

    const onProjectChange = (projectId: string) => {
        setProjectId(projectId);
        setSelectedAnnotation(null);
        setSlide(null);
        setSlideTour({ active: false, index: 0, entries: [] })
    };

    if (projectId) {
        return <ProjectView projectId={projectId} onProjectChange={onProjectChange} />
    }

    return (
        <div className="flex flex-col mx-auto box-content h-full w-full max-w-md bg-white overflow-hidden md:border md:rounded-lg md:shadow-md">
            <div className="p-4 flex flex-col gap-4 bg-gray-50 shadow">
                <header className="my-4">
                    <h1 className="font-serif text-2xl text-center sm:text-4xl">OpenMicroanatomy</h1>
                </header>

                <HostSelector hosts={hosts} />

                {host &&
                    <OrganizationSelector
                        currentOrganization={organization}
                        organizations={organizations}
                        workspaces={workspaces}
                        onOrganizationChange={setOrganization}
                    />
                }
            </div>

            <div className="flex-grow overflow-y-auto scrollbar">
                {(host && organization) ? (
                    <ProjectSelector
                        workspaces={workspaces}
                        organization={organization}
                        onProjectChange={onProjectChange}
                    />
                ) : (
                    <p className="h-full flex items-center justify-center font-bold text-slate-600">Select organization to continue</p>
                )}
            </div>
        </div>
    );
};
