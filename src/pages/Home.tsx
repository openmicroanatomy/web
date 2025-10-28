import ProjectView from "components/ProjectView";
import Constants from "lib/constants";
import { getValue } from "lib/localStorage";
import { useEffect, useState } from "react";
import { EduOrganization, EduServer } from "types";
import { fetchServers, fetchOrganizations, fetchWorkspaces } from "lib/api";
import { toast } from "react-toastify";
import { useStore } from "../lib/StateStore";
import { LessonSelectorModal } from "../components/LessonSelectorModal";

export default function Home() {
    const [ servers, setServers ] = useState<EduServer[]>([]);
    const [ loading, setLoading ] = useState(true);

    const [ initializeServer, setOrganization ] = useStore(state => [ state.initializeServer, state.setOrganization ]);

    useEffect(() => {
        (async () => {
            try {
                // Read from browser's local storage the previous server and organization
                const cachedServer: EduServer = getValue(Constants.PREVIOUS_HOST_KEY);
                const cachedOrg: EduOrganization = getValue(Constants.PREVIOUS_ORGANIZATION_KEY);

                if (cachedServer) {
                    const [ organizations, workspaces ] = await Promise.all([
                        fetchOrganizations(cachedServer.host),
                        fetchWorkspaces(cachedServer.host)
                    ]);

                    initializeServer(cachedServer, organizations, workspaces);

                    if (cachedOrg) {
                        setOrganization(cachedOrg);
                    }

                    setLoading(false);
                }

                setServers(await fetchServers());
            } catch (err) {
                toast.error("Error while loading latest hosts, please retry ...");
                console.error("Error while fetching hosts", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <p>Loading ...</p>;
    }

    return (
        <>
            <LessonSelectorModal servers={servers} />
            <ProjectView />
        </>
    )
};
