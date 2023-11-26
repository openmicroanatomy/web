import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { Project } from "types";
import Annotations from "./Annotations";
import EmbedProjectPopup from "./project/EmbedProjectPopup";
import ToggleSidebar from "./project/ToggleSidebar";
import Slides from "./Slides";
import SlideTour from "./SlideTour";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentSlideState, sidebarVisibleState, slideTourState } from "../lib/atoms";
import { ToggleDisplaySlideNumbers } from "./project/ToggleDisplaySlideNumbers";

type Props = {
    projectId: string;
    projectData: Project | null;
    embedded: boolean;
    onProjectChange: (project: string) => void;
}

export default function ProjectViewSidebar({ projectId, projectData, embedded, onProjectChange }: Props) {
    const [ sideBarVisible, setSidebarVisible ] = useRecoilState(sidebarVisibleState);
    const slide = useRecoilValue(currentSlideState);
    const slideTour = useRecoilValue(slideTourState);

    const annotations = JSON.parse(slide?.annotations || "[]");

    return (
        <div
            className={`w-1/4 border-r rounded-l-lg overflow-hidden ${sideBarVisible ? "bg-gray-50" : "w-4 bg-gray-100 cursor-pointer"} transition-all ease-in-out duration-500`}
            onClick={() => sideBarVisible ? null : setSidebarVisible(true) }
        >
            <div className={`flex flex-col transition h-full max-h-full duration-500 ${sideBarVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <div className="flex justify-between p-2 bg-white">
                    { !embedded &&
                        <a className="cursor-pointer font-mono font-bold text-slate-600" onClick={() => onProjectChange("")}>
                            &laquo; Return to lessons
                        </a>
                    }

                    <div className="flex justify-end gap-1">
                        <ToggleSidebar />

                        <ToggleDisplaySlideNumbers />

                        <EmbedProjectPopup slide={slide} projectId={projectId} />
                    </div>
                </div>

                <Tabs className="flex flex-col flex-grow overflow-y-hidden">
                    <TabList>
                        <Tab>Slides</Tab>
                        <Tab>Annotations</Tab>
                    </TabList>

                    <TabPanel className="react-tabs__tab-panel h-full overflow-y-auto scrollbar bg-gray-50" forceRender>
                        <Slides slides={projectData?.images} />
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
