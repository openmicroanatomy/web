import { hostState } from "lib/atoms";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Annotations from "./Annotations";
import Viewer from "./Viewer";
import { useSetRecoilState } from "recoil";
import { fetchProjectData } from "lib/api";
import { toast } from "react-toastify";
import { ProjectData } from "types";

interface EmbeddedSingleSlideSlugs {
    host: string;
    project: string;
    slide: string;
}

function EmbeddedSingleSlide() {
    const [annotations, setAnnotations] = useState([]);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [enabled, setEnabled] = useState(false);

    const setHost = useSetRecoilState(hostState);
    const slugs = useParams<EmbeddedSingleSlideSlugs>();
    
    useEffect(() => {
        (async function() {
            await setHost({ id: "embedded-host", name: "Embedded host", host: ("https://" + slugs.host), img: "" });

            const apiHelper = async () => {
                try {
                    const data = await fetchProjectData(slugs.project) as ProjectData;
    
                    if (data.images.length == 0) {
                        return;
                    }
                    
                    for (const image of data.images) {
                        if (image.serverBuilder.uri.indexOf(slugs.slide) > -1) {
                            if (image.annotations) {
                                setAnnotations(JSON.parse(image.annotations));
                            } else {
                                setAnnotations([]);
                            }

                            break;
                        }
                    }
                } catch (e) {
                    setAnnotations([]);
    
                    if (e instanceof Error) {
                        toast.error(e.message);
                    }
                }
            };

            apiHelper();
        })();
    }, []);

    return (
        <main className="flex flex-grow p-2 gap-2 overflow-hidden">
            {enabled ? (
                <>
                    {sidebarVisible ? (
                        <div className="flex-none w-1/4 border rounded-sm shadow-lg bg-white overflow-y-auto scrollbar">
                            <div className="p-2">
                                <a className="float-right cursor-pointer sidebar--toggle" onClick={() => setSidebarVisible((o) => !o)}>
                                    &laquo;
                                </a>
                            </div>

                            <Annotations annotations={annotations} />
                        </div>
                    ) : (
                        <a
                            className="cursor-pointer sidebar--toggle"
                            onClick={() => setSidebarVisible((o) => !o)}
                        >
                            &raquo;
                        </a>
                    )}

                    <div className="flex-grow border rounded-sm shadow-lg bg-white">
                        <Viewer slideId={slugs.slide} annotations={annotations} />
                    </div>
                </>
            ) : ( 
                <div className="flex flex-grow items-center justify-center">
                    <button onClick={() => setEnabled(true)} className="button h-12r">View slide [Host: {slugs.host}, ID: {slugs.slide}]</button>
                </div>
            )}
        </main>
    );
}

export default EmbeddedSingleSlide;
