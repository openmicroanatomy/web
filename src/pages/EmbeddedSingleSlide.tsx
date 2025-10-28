import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Viewer from "../components/Viewer";
import { fetchProject } from "lib/api";
import { toast } from "react-toastify";
import ToggleSidebar from "../components/project/ToggleSidebar";
import Annotations from "../components/Annotations";
import { useStore } from "../lib/StateStore";
import { parseSlideTourEntries } from "../lib/helpers";

type Slugs = {
    host: string;
    project: string;
    slide: string;
}

export default function EmbeddedSingleSlide() {
    const [ server, initializeServer, slide, setSlide, setSlideTour, sideBarVisible, setSidebarVisible ] = useStore(state => [
        state.server, state.initializeServer, state.slide, state.setSlide, state.setSlideTour, state.sidebarVisible, state.setSidebarVisible
    ]);

    const [ loading, setLoading ] = useState(true);

    const slugs = useParams<Slugs>();
    
    useEffect(() => {
        (async function() {
            try {
                initializeServer({ id: "embedded-host", name: "Embedded host", host: ("https://" + slugs.host), img: "" }, [], []);

                const project = await fetchProject(slugs.project);

                if (project.images.length == 0) {
                    toast.error("Lesson has no slides associated.")
                    return;
                }

                const slide = project.images.find(
                    slide => slide.serverBuilder.uri.indexOf(slugs.slide) > -1
                )

                if (slide) {
                    setSlideTour({
                        active: false,
                        index: 0,
                        entries: parseSlideTourEntries(slide)
                    });

                    setSlide(slide);
                } else {
                    toast.error("Could not find provided slide.")
                }
            } catch (e) {
                console.error("Error while initializing or loading slide", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <p className="font-bold">Loading ...</p>
    }

    if (!server) {
        return <p className="font-bold">Error: missing server from URL.</p>
    }

    if (!slide) {
        return <p className="font-bold">Error while loading slide; see console for possibly additional information</p>
    }

    return (
        <main className="flex h-full border border-gray-300 rounded-lg overflow-hidden">
            <div
              className={`w-1/4 border-r rounded-l-lg overflow-hidden ${sideBarVisible ? "bg-gray-50" : "w-4 bg-gray-100 cursor-pointer"} transition-all ease-in-out duration-500`}
              onClick={() => sideBarVisible ? null : setSidebarVisible(true) }
            >
                <div className={`flex flex-col transition h-full max-h-full duration-500 ${sideBarVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="flex justify-end p-2 bg-white border-b">
                        <ToggleSidebar />
                    </div>

                    <div className="h-full overflow-y-auto scrollbar bg-gray-50">
                        <Annotations />
                    </div>
                </div>
            </div>

            <div className="flex-grow bg-white">
                <Viewer />
            </div>
        </main>
    );
}
