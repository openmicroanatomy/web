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
    annotations: Annotation[];
    onProjectChange: (project: string) => void;
    onSlideChange: (newSlide: Image) => void;
}

function ProjectViewSidebar({ slide, projectId, projectData, embedded, annotations, onProjectChange, onSlideChange }: ProjectViewSidebarProps) {
    const slideTour = useRecoilValue(slideTourState);

    return (
        <div className="flex-none w-1/4 border rounded-sm shadow-lg bg-white overflow-y-auto scrollbar">
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

            <Tabs>
                <TabList className="flex sticky top-12 border-b bg-white">
                    <Tab>Slides</Tab>
                    <Tab>Annotations</Tab>
                </TabList>

                <TabPanel>
                    <Slides slides={projectData?.images} onSlideChange={onSlideChange} />
                </TabPanel>

                <TabPanel>
                    <SlideTour />

                    { !slideTour.active && <Annotations annotations={annotations} /> }
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default ProjectViewSidebar;
