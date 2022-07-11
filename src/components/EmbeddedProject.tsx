import { hostState } from "lib/atoms";
import { useParams } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import ProjectView from "./ProjectView";

interface EmbeddedProjectSlugs {
    host: string;
    project: string;
}

function EmbeddedProject() {
    const setHost = useSetRecoilState(hostState);
    const slugs = useParams<EmbeddedProjectSlugs>();
    
    // TODO: This is illegal
    setHost({ id: "embedded-host", name: "Embedded host", host: ("https://" + slugs.host), img: "" });

    return (
        <ProjectView projectId={slugs.project} onProjectChange={() => null} />
    );
}

export default EmbeddedProject;
