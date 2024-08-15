import PopupLarge from "components/PopupLarge";
import { hostState } from "lib/atoms";
import { getRecoil } from "recoil-nexus";
import { Slide } from "types";

type Props = {
    slide: Slide | null;
    projectId: string;
}

export default function EmbedProjectPopup({ slide, projectId}: Props) {
    const host = getRecoil(hostState);
    
    const EmbedFrameTemplate = (data: string) => { // TODO: remove leading tabs
        return `<iframe
            class="embedded-qupath-slide"
            src="https://qupath.oulu.fi/#!/embed/${data}"
            width="1200px"
            height="600px"
            loading="lazy"
            allow="fullscreen"
            style="border: 1px solid #ccc"></iframe>`
    }

    const ShareLink = (data: string) => {
        return `https://qupath.oulu.fi/#!/embed/${data}`
    }

    const CreateUrl = (projectId: string, slide: Slide | null = null) => {
        if (!host) return "";

        let url = host.host;

        if (url.endsWith("/")) {
            url = url.slice(0, -1);
        }

        url = url.replace("https://", "")
                 .replace("http://", "");

        if (slide) {
            const slideId = new URL(slide.serverBuilder.uri).pathname.substring(1);
            return `${url}/${projectId}/${slideId}`;
        } else {
            return `${url}/${projectId}`;
        }
    }

    return (
        <PopupLarge 
            activator={
                <a
                    className="rounded--button"
                    title="Embed on another website"
                >
                    &lt;&gt;
                </a>
            }
        >
            <p className="font-bold">Share current project</p>
            <a href={ShareLink(CreateUrl(projectId))} className="block border bg-slate-50 rounded p-4">
                {ShareLink(CreateUrl(projectId))}
            </a>

            <p className="font-bold">Share current slide</p>
            { slide ? 
                <a href={ShareLink(CreateUrl(projectId, slide))} className="block border bg-slate-50 rounded p-4">
                    {ShareLink(CreateUrl(projectId, slide))}
                </a>
            :
                <p className="italic">No slide currently opened</p>    
            }

            <p className="font-bold pt-4">Embed current project</p>
            <pre className="border whitespace-pre-wrap bg-slate-50 rounded p-2">{ EmbedFrameTemplate(CreateUrl(projectId)) }</pre>

            <p className="font-bold">Embed current slide</p>

            { slide ? 
                <pre className="border whitespace-pre-wrap bg-slate-50 rounded p-2">
                    { EmbedFrameTemplate(CreateUrl(projectId, slide)) }
                </pre>
            :
                <p className="italic">No slide currently opened</p>    
            }
        </PopupLarge>  
    )
}
