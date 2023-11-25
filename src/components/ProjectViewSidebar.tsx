import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { Project } from "types";
import Annotations from "./Annotations";
import EmbedProjectPopup from "./project/EmbedProjectPopup";
import ToggleSidebar from "./project/ToggleSidebar";
import Slides from "./Slides";
import SlideTour from "./SlideTour";
import { useRecoilValue } from "recoil";
import { currentSlideState, slideTourState } from "../lib/atoms";
import { ToggleDisplaySlideNumbers } from "./project/ToggleDisplaySlideNumbers";

type Props = {
    projectId: string;
    projectData: Project | null;
    embedded: boolean;
    onProjectChange: (project: string) => void;
}

export default function ProjectViewSidebar({ projectId, projectData, embedded, onProjectChange }: Props) {
    const slide = useRecoilValue(currentSlideState);
    const slideTour = useRecoilValue(slideTourState);

    const annotations = JSON.parse(slide?.annotations || "[]");

    return (
        <div className="flex flex-col w-1/4 border rounded-sm shadow-lg bg-gray-50">
            <div className="sticky top-0">
                <div className="flex justify-between sticky top-0 p-2 bg-white">
                    { !embedded && 
                        <a className="cursor-pointer font-mono font-bold" onClick={() => onProjectChange("")}>
                            &laquo; Return to lessons
                        </a>
                    }

                    <div className="flex justify-end gap-1">
                        <ToggleSidebar />

                        <ToggleDisplaySlideNumbers />

                        <EmbedProjectPopup slide={slide} projectId={projectId} />                                
                    </div>
                </div>
            </div>

            <Tabs className="react-tabs flex flex-col min-h-0">
                <TabList className="flex sticky top-12 border-b bg-white">
                    <Tab>Slides</Tab>
                    <Tab>Annotations</Tab>
                </TabList>

                <TabPanel className="react-tabs__tab-panel overflow-y-auto scrollbar bg-gray-50" forceRender>
                    <Slides slides={projectData?.images} />
                </TabPanel>

                <TabPanel className="react-tabs__tab-panel overflow-y-auto scrollbar bg-gray-50" forceRender>
                    <SlideTour />

                    { !slideTour.active && <Annotations annotations={annotations} /> }
                </TabPanel>
            </Tabs>
        </div>
    );
}
