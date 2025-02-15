import ProjectView from "components/ProjectView";
import Constants from "lib/constants";
import { getValue } from "lib/localStorage";
import { useEffect, useState } from "react";
import { EduServer } from "types";
import { fetchServers, fetchOrganizations, fetchWorkspaces } from "lib/api";
import { toast } from "react-toastify";
import { useStore } from "../lib/StateStore";
import { AllSelector } from "../components/AllSelector";

export default function Home() {
    const [ servers, setServers ] = useState<EduServer[]>([]);
    const [ loading, setLoading ] = useState(true);

    const [ initializeServer ] = useStore(state => [ state.initializeServer ]);
    const [ project ] = useStore(state => [ state.project ]);

    useEffect(() => {
        (async () => {
            // Read from browser's local storage the previous server
            const cachedServer: EduServer = getValue(Constants.LOCALSTORAGE_HOST_KEY);

            if (cachedServer) {
                const [ organizations, workspaces ] = await Promise.all([
                    fetchOrganizations(cachedServer.host),
                    fetchWorkspaces(cachedServer.host)
                ]);

                initializeServer(cachedServer, organizations, workspaces);

                setLoading(false);
            }

            try {
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

    if (project) {
        return <ProjectView project={project} />;
    } else {
        return <AllSelector servers={servers} />;
    }
};
