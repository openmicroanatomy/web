import { useParams } from "react-router-dom";
import ProjectView from "../components/ProjectView";
import { useEffect, useState } from "react";
import { useStore } from "../lib/StateStore";
import { fetchProject } from "../lib/api";

type Slugs = {
    host: string;
    project: string;
}

export default function EmbeddedProject() {
    const [ server, initializeServer, project, setProject ] = useStore(state => [
      state.server, state.initializeServer, state.project, state.setProject
    ]);

    const [ loading, setLoading ] = useState(true);

    const slugs = useParams<Slugs>();
    
    useEffect(() => {
        (async function() {
            try {
                initializeServer({ id: "embedded-host", name: "Embedded host", host: ("https://" + slugs.host), img: "" }, [], []);

                const project = await fetchProject(slugs.project);
                setProject(project)
            } catch (e) {
                console.error("Error while initializing or loading project", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <p className="font-bold">Loading ...</p>
    }

    if (!server) {
        return <p className="font-bold">Error: missing server from URL.</p>
    }

    if (!project) {
        return <p className="font-bold">Error while loading lesson; see console for possibly additional information</p>
    }

    return (
        <ProjectView embedded />
    );
}
