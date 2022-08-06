import { hostState, sidebarVisibleState } from "lib/atoms";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "./Viewer";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { fetchProjectData } from "lib/api";
import { toast } from "react-toastify";
import { ProjectData, Image } from "types";
import ToggleSidebar from "./project/ToggleSidebar";
import Annotations from "./Annotations";

interface EmbeddedSingleSlideSlugs {
    host: string;
    project: string;
    slide: string;
}

function EmbeddedSingleSlide() {
    const [annotations, setAnnotations] = useState([]);
    const [slide, setSlide] = useState<Image | null>(null);
    const sidebarVisible = useRecoilValue(sidebarVisibleState);
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
                    
                    for (const slide of data.images) {
                        if (slide.serverBuilder.uri.indexOf(slugs.slide) > -1) {
                            setSlide(slide);
                            setAnnotations(JSON.parse(slide.annotations || "[]"));

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
                            <div className="flex justify-end p-2">
                                <ToggleSidebar />
                            </div>

                            <Annotations annotations={annotations} />
                        </div>
                    ) : (
                        <ToggleSidebar />
                    )}

                    <div className="flex-grow border rounded-sm shadow-lg bg-white">
                        <Viewer slide={slide} annotations={annotations} />
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
