import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import Annotations from "./Annotations";
import EmbedProjectPopup from "./project/EmbedProjectPopup";
import ToggleSidebar from "./project/ToggleSidebar";
import Slides from "./Slides";
import SlideTour from "./SlideTour";
import { ToggleDisplaySlideNumbers } from "./project/ToggleDisplaySlideNumbers";
import { useStore } from "../lib/StateStore";
import { useMemo } from "react";
import { Project } from "../types";

type Props = {
    project: Project;
    embedded: boolean;
}

export default function ProjectViewSidebar({ project, embedded }: Props) {
    const [ setProject, sideBarVisible, setSidebarVisible, slide, slideTour ] = useStore(state => [
      state.setProject, state.sidebarVisible, state.setSidebarVisible, state.slide, state.slideTour
    ]);

    const annotations = useMemo(
      () => JSON.parse(slide?.annotations || "[]"),
      [slide]
    );

    return (
        <div
            className={`w-1/4 border-r rounded-l-lg overflow-hidden ${sideBarVisible ? "bg-gray-50" : "w-4 bg-gray-100 cursor-pointer"} transition-all ease-in-out duration-500`}
            onClick={() => sideBarVisible ? null : setSidebarVisible(true) }
        >
            <div className={`flex flex-col transition h-full max-h-full duration-500 ${sideBarVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <div className="flex justify-between p-2 bg-white">
                    { !embedded &&
                        <a className="cursor-pointer font-mono font-bold text-slate-600" onClick={() => setProject(null)}>
                            &laquo; Return to lessons
                        </a>
                    }

                    <div className="flex justify-end gap-1">
                        <ToggleSidebar />

                        <ToggleDisplaySlideNumbers />

                        <EmbedProjectPopup slide={slide} />
                    </div>
                </div>

                <Tabs className="flex flex-col flex-grow overflow-y-hidden">
                    <TabList>
                        <Tab>Slides</Tab>
                        <Tab>Annotations</Tab>
                    </TabList>

                    <TabPanel className="react-tabs__tab-panel h-full overflow-y-auto scrollbar bg-gray-50" forceRender>
                        <Slides slides={project.images} />
                    </TabPanel>

                    <TabPanel className="react-tabs__tab-panel h-full overflow-y-auto scrollbar bg-gray-50" forceRender>
                        <SlideTour />

                        { !slideTour.active && <Annotations annotations={annotations} /> }
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    );
}
