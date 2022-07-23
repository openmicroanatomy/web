import PopupLarge from "components/PopupLarge";
import { hostState } from "lib/atoms";
import { getRecoil } from "recoil-nexus";
import { Host } from "types";

interface EmbedProjectPopupProps {
    slideId: string;
    projectId: string;
}

function EmbedProjectPopup({ slideId, projectId}: EmbedProjectPopupProps) {
    const host = getRecoil(hostState);
    
    const EmbedFrameTemplate = (data: string) => { // TODO: remove leading tabs
        return `<iframe
            class="embedded-qupath-slide"
            src="https://edu.qupath.yli-hallila.fi/#!/embed/` + data + `"
            width="1200px"
            height="600px"
            loading="lazy"
            allow="fullscreen"
            style="border: 1px solid #ccc"></iframe>`
    }

    const HostToReadable = (host: Host | null) => {
        if (host && host.host) {
            return host.host
                .replace("https://", "")
                .replace("http://", "");
        }

        return "";
    }

    return (
        <PopupLarge 
            activator={
                <a className="rounded--button">&lt;&gt;</a>   
            }
        >
            <h2 className="font-bold italic">Embed current project</h2>
            <pre className="border whitespace-pre-wrap bg-slate-50 rounded p-2">{ EmbedFrameTemplate(HostToReadable(host) + "/" + projectId) }</pre>

            <h2 className="font-bold italic">Embed current slide</h2>

            { slideId ? 
                <pre className="border whitespace-pre-wrap bg-slate-50 rounded p-2">{ EmbedFrameTemplate(HostToReadable(host) + "/" + projectId + "/" + slideId) }</pre>
            :
                <p>No slide currently opened</p>    
            }
        </PopupLarge>  
    )
}

export default EmbedProjectPopup;
