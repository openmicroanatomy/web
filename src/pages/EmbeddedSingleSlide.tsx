import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Viewer from "../components/Viewer";
import { fetchProject } from "lib/api";
import { toast } from "react-toastify";
import { Project } from "types";
import ToggleSidebar from "../components/project/ToggleSidebar";
import Annotations from "../components/Annotations";
import { useStore } from "../lib/StateStore";
import { parseSlideTourEntries } from "../components/ProjectView";

type Slugs = {
    host: string;
    project: string;
    slide: string;
}

export default function EmbeddedSingleSlide() {
    const [ server, initializeServer, setSlide, setSlideTour, sideBarVisible, setSidebarVisible ] = useStore(state => [
        state.server, state.initializeServer, state.setSlide, state.setSlideTour, state.sidebarVisible, state.setSidebarVisible
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
                    toast.error("Lesson has no slides associated.")
                    return;
                }

                const slide = data.images.find(
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
            }).catch(e => {
                console.error(e);
                toast.error(e.message);
            })
    }, [server]);

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
