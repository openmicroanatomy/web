import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "../components/Viewer";
import { fetchProject } from "lib/api";
import { toast } from "react-toastify";
import { Project, Slide, Annotation } from "types";
import ToggleSidebar from "../components/project/ToggleSidebar";
import Annotations from "../components/Annotations";
import { useStore } from "../lib/StateStore";

type Slugs = {
    host: string;
    project: string;
    slide: string;
}

export default function EmbeddedSingleSlide() {
    const [annotations, setAnnotations] = useState([]);
    const [slide, setSlide] = useState<Slide | null>(null);
    const [ sideBarVisible, setSidebarVisible ] = useStore(state => [
      state.sidebarVisible, state.setSidebarVisible
    ]);

    const [server, initializeServer] = useStore(state => [
        state.server, state.initializeServer
    ]);

    const slugs = useParams<Slugs>();
    
    useEffect(() => {
        initializeServer({ id: "embedded-host", name: "Embedded host", host: ("https://" + slugs.host), img: "" }, [], []);
    }, []);

    useEffect(() => {
        if (!server) {
            return;
        }

        fetchProject(slugs.project)
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
    }, [server]);

    return (
        <main className="flex h-full shadow-lg rounded-lg overflow-hidden">
            <div
              className={`w-1/4 border-r rounded-l-lg overflow-hidden ${sideBarVisible ? "bg-gray-50" : "w-4 bg-gray-100 cursor-pointer"} transition-all ease-in-out duration-500`}
              onClick={() => sideBarVisible ? null : setSidebarVisible(true) }
            >
                <div className={`flex flex-col transition h-full max-h-full duration-500 ${sideBarVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex justify-end p-2 bg-white border-b">
                        <ToggleSidebar />
                    </div>

                    <div className="h-full overflow-y-auto scrollbar bg-gray-50">
                        <Annotations annotations={annotations} />
                    </div>
                </div>
            </div>

            <div className="flex-grow bg-white">
                <Viewer slide={slide} />
            </div>
        </main>
    );
}
