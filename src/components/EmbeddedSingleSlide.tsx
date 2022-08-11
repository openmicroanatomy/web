import { hostState, sidebarVisibleState } from "lib/atoms";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "./Viewer";
import { useRecoilState, useRecoilValue } from "recoil";
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

    const [host, setHost] = useRecoilState(hostState);
    const slugs = useParams<EmbeddedSingleSlideSlugs>();
    
    useEffect(() => {
        setHost({ id: "embedded-host", name: "Embedded host", host: ("https://" + slugs.host), img: "" });
    }, []);

    useEffect(() => {
        if (!host) {
            return;
        }

        fetchProjectData(slugs.project)
            .then((data: ProjectData) => {
                if (data.images.length == 0) {
                    return;
                }

                const slide = data.images.find(
                    slide => slide.serverBuilder.uri.indexOf(slugs.slide) > -1
                )

                if (slide) {
                    setSlide(slide);
                    setAnnotations(JSON.parse(slide.annotations || "[]"));
                }
            }).catch(e => {
                console.error(e);
                toast.error(e.message);
            })
    }, [host]);

    return (
        <main className="flex flex-grow p-2 gap-2 overflow-hidden">
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
        </main>
    );
}

export default EmbeddedSingleSlide;
