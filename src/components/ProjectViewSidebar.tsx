import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { Annotation, ProjectData } from "types";
import Annotations from "./Annotations";
import EmbedProjectPopup from "./project/EmbedProjectPopup";
import ToggleSidebar from "./project/ToggleSidebar";
import Slides from "./Slides";

interface ProjectViewSidebarProps {
    slideId: string;
    projectId: string;
    projectData: ProjectData | null;
    embedded: boolean;
    annotations: Annotation[];
    onProjectChange: (project: string) => void;
    onSlideChange: (slide: string) => void;
}

function ProjectViewSidebar({ slideId, projectId, projectData, embedded, annotations, onProjectChange, onSlideChange }: ProjectViewSidebarProps) {
    return (
        <div className="flex-none w-1/4 border rounded-sm shadow-lg bg-white overflow-y-auto scrollbar">
            <div className="sticky top-0">
                <div className="flex justify-between sticky top-0 p-2 bg-white">
                    { !embedded && 
                        <a className="cursor-pointer" onClick={() => onProjectChange("")}>
                            Return to projects
                        </a>
                    }

                    <div className="flex justify-end gap-1">
                        <ToggleSidebar />

                        <EmbedProjectPopup slideId={slideId} projectId={projectId} />                                
                    </div>
                </div>
            </div>

            <Tabs>
                <TabList className="flex sticky top-12 border-b bg-white">
                    <Tab>Slides</Tab>
                    <Tab>Annotations</Tab>
                </TabList>

                <TabPanel>
                    <Slides images={projectData?.images} onSlideChange={onSlideChange} />
                </TabPanel>

                <TabPanel>
                    <Annotations annotations={annotations} />
                </TabPanel>
            </Tabs>
        </div>
    );
}

export default ProjectViewSidebar;
