import { hostState } from "lib/atoms";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import ProjectView from "./ProjectView";
import { useEffect } from "react";

interface EmbeddedProjectSlugs {
    host: string;
    project: string;
}

function EmbeddedProject() {
    const [host, setHost] = useRecoilState(hostState);
    const slugs = useParams<EmbeddedProjectSlugs>();
    
    useEffect(() => {
        setHost({ id: "embedded-host", name: "Embedded host", host: ("https://" + slugs.host), img: "" });
    }, []);

    if (!host) {
        return <p className="font-bold">Error while loading lesson: host not available.</p>
    }

    return (
        <ProjectView projectId={slugs.project} onProjectChange={() => null} embedded />
    );
}

export default EmbeddedProject;
