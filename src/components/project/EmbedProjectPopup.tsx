import PopupLarge from "components/PopupLarge";
import { EduServer, Slide } from "types";
import { useStore } from "../../lib/StateStore";

type Props = {
    slide: Slide | null;
}

function EmbedFrameTemplate(data: string) { // TODO: remove leading tabs
    return `<iframe
            class="embedded-qupath-slide"
            src="https://qupath.oulu.fi/#!/embed/${data}"
            width="1200px"
            height="600px"
            loading="lazy"
            allow="fullscreen"
            style="border: 1px solid #ccc"></iframe>`;
}

function ShareLink(data: string) {
    return `https://qupath.oulu.fi/#!/embed/${data}`;
}

function CreateUrl(host: EduServer, projectId: string, slide: Slide | null = null) {
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

export default function EmbedProjectPopup({ slide }: Props) {
    const [ project, server ] = useStore(state =>
      [ state.project, state.server ]
    );

    if (!project || !server) {
        return null;
    }

    return (
        <PopupLarge 
            activator={
                <a
                    className="rounded--button font-mono"
                    title="Embed on another website"
                >
                    &lt;/&gt;
                </a>
            }
        >
            <p className="font-bold">Share current project</p>
            <a href={ShareLink(CreateUrl(server, project.id))} className="block border bg-slate-50 rounded p-4">
                {ShareLink(CreateUrl(server, project.id))}
            </a>

            <p className="font-bold">Share current slide</p>
            { slide ? 
                <a href={ShareLink(CreateUrl(server, project.id, slide))} className="block border bg-slate-50 rounded p-4">
                    {ShareLink(CreateUrl(server, project.id, slide))}
                </a>
            :
                <p className="italic">No slide currently opened</p>    
            }

            <p className="font-bold pt-4">Embed current project</p>
            <pre className="border whitespace-pre-wrap bg-slate-50 rounded p-2">{ EmbedFrameTemplate(CreateUrl(server, project.id)) }</pre>

            <p className="font-bold">Embed current slide</p>

            { slide ? 
                <pre className="border whitespace-pre-wrap bg-slate-50 rounded p-2">
                    { EmbedFrameTemplate(CreateUrl(server, project.id, slide)) }
                </pre>
            :
                <p className="italic">No slide currently opened</p>    
            }
        </PopupLarge>  
    )
}
