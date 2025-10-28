import PopupLarge from "components/PopupLarge";
import { EduServer, Slide } from "types";
import { useStore } from "../../lib/StateStore";
import { LinkIcon } from "@heroicons/react/24/outline";

type Props = {
    slide: Slide | null;
}

function CreateIFrame(path: string) {
    return [
        `<iframe`,
        `   class="embedded-qupath-slide"`,
        `   src="${CreateEmbedLink(path)}"`,
        `   width="1200px"`,
        `   height="600px"`,
        `   loading="lazy"`,
        `   allow="fullscreen"`,
        `   style="border: 1px solid #ccc"></iframe>`
    ].join("\n");
}

/**
 * Create an embed link relative to this OpenMicroanatomy instance.
 * @param path
 */
function CreateEmbedLink(path: string) {
    return `${window.location.href}embed/${path}`;
}

/**
 * Gets the absolute URL for provided project or slide. Slide is optional.
 * This strips any http:// or https:// protocol from the URL. OpenMicroanatomy assumes that it uses https://
 * @param host
 * @param projectId
 * @param slide optional
 */
function GetURL(host: EduServer, projectId: string, slide: Slide | null = null) {
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
                    title="Share and embed"
                >
                    <LinkIcon width={20} height={20} />
                </a>
            }
        >
            <p className="font-bold">Share current project</p>
            <a href={CreateEmbedLink(GetURL(server, project.id))} className="block border bg-slate-50 rounded p-4 hover:underline">
                {CreateEmbedLink(GetURL(server, project.id))}
            </a>

            <p className="font-bold">Share current slide</p>
            { slide ? 
                <a href={CreateEmbedLink(GetURL(server, project.id, slide))} className="block border bg-slate-50 rounded p-4 hover:underline">
                    {CreateEmbedLink(GetURL(server, project.id, slide))}
                </a>
            :
                <p className="italic">No slide currently opened</p>    
            }

            <details className="py-4">
                <summary className={"font-bold cursor-pointer"}>Embed current project</summary>

                <pre className="border whitespace-pre-wrap bg-slate-50 rounded p-2">{ CreateIFrame(GetURL(server, project.id)) }</pre>
            </details>

            <details>
                <summary className="font-bold cursor-pointer">Embed current slide</summary>

                { slide ?
                    <pre className="border whitespace-pre-wrap bg-slate-50 rounded p-2">
                        { CreateIFrame(GetURL(server, project.id, slide)) }
                    </pre>
                :
                    <p className="italic">No slide currently opened</p>
                }
            </details>
        </PopupLarge>
    )
}
