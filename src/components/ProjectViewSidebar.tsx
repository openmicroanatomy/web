import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { Annotation, Image, ProjectData } from "types";
import Annotations from "./Annotations";
import EmbedProjectPopup from "./project/EmbedProjectPopup";
import ToggleSidebar from "./project/ToggleSidebar";
import Slides from "./Slides";
import SlideTour from "./SlideTour";
import { useRecoilValue } from "recoil";
import { slideTourState } from "../lib/atoms";

interface ProjectViewSidebarProps {
    slide: Image | null;
    projectId: string;
    projectData: ProjectData | null;
    embedded: boolean;
    onProjectChange: (project: string) => void;
}

function ProjectViewSidebar({ slide, projectId, projectData, embedded, onProjectChange }: ProjectViewSidebarProps) {
    const slideTour = useRecoilValue(slideTourState);

    const annotations = JSON.parse(slide?.annotations || "[]");

    return (
        <div className="flex flex-col w-1/4 border rounded-sm shadow-lg bg-white">
            <div className="sticky top-0">
                <div className="flex justify-between sticky top-0 p-2 bg-white">
                    { !embedded && 
                        <a className="cursor-pointer font-bold" onClick={() => onProjectChange("")}>
                            Return to lessons
                        </a>
                    }

                    <div className="flex justify-end gap-1">
                        <ToggleSidebar />

                        <EmbedProjectPopup slide={slide} projectId={projectId} />                                
                    </div>
                </div>
            </div>

            <Tabs className="react-tabs flex flex-col min-h-0">
                <TabList className="flex sticky top-12 border-b bg-white">
                    <Tab>Slides</Tab>
                    <Tab>Annotations</Tab>
                </TabList>

                <TabPanel className="react-tabs__tab-panel overflow-y-auto scrollbar" forceRender>
                    <Slides slides={projectData?.images} />
                </TabPanel>

                <TabPanel className="react-tabs__tab-panel overflow-y-auto scrollbar" forceRender>
                    <SlideTour />

                    { !slideTour.active && <Annotations annotations={annotations} /> }
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default ProjectViewSidebar;
