import { hostState, sidebarVisibleState } from "lib/atoms";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "./Viewer";
import { useRecoilState, useRecoilValue } from "recoil";
import { fetchProjectData } from "lib/api";
import { toast } from "react-toastify";
import { Project, Slide, Annotation } from "types";
import ToggleSidebar from "./project/ToggleSidebar";
import Annotations from "./Annotations";

type Slugs = {
    host: string;
    project: string;
    slide: string;
}

export default function EmbeddedSingleSlide() {
    const [annotations, setAnnotations] = useState([]);
    const [slide, setSlide] = useState<Slide | null>(null);
    const sidebarVisible = useRecoilValue(sidebarVisibleState);

    const [host, setHost] = useRecoilState(hostState);
    const slugs = useParams<Slugs>();
    
    useEffect(() => {
        setHost({ id: "embedded-host", name: "Embedded host", host: ("https://" + slugs.host), img: "" });
    }, []);

    useEffect(() => {
        if (!host) {
            return;
        }

        fetchProjectData(slugs.project)
            .then((data: Project) => {
                if (data.images.length == 0) {
                    return;
                }

                const slide = data.images.find(
                    slide => slide.serverBuilder.uri.indexOf(slugs.slide) > -1
                )

                if (slide) {
                    const annotations = JSON.parse(slide.annotations || "[]");
                    annotations.sort((a: Annotation, b: Annotation) => {
                        // Check that both annotations have a name.
                        if (!a.properties.name || !b.properties.name) {
                            return 0;
                        }

                        return a.properties.name.localeCompare(b.properties.name, undefined, { numeric: true, sensitivity: 'base' });
                    });

                    // TODO: Add support for slide tours

                    setAnnotations(annotations);
                    setSlide(slide);
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
                <Viewer slide={slide} />
            </div>
        </main>
    );
}
