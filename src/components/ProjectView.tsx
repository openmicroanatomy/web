import { fetchProjectData } from "lib/api";
import { sidebarVisibleState } from "lib/atoms";
import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { toast } from "react-toastify";
import { useRecoilValue } from "recoil";
import "styles/Scrollbar.css";
import "styles/Sidebar.css";
import "styles/Tabs.css";
import { ProjectData, Image } from "types";
import ToggleSidebar from "./project/ToggleSidebar";
import ProjectInformation from "./ProjectInformation";
import ProjectViewSidebar from "./ProjectViewSidebar";
import Viewer from "./Viewer";

interface ProjectViewProps {
    projectId: string;
    onProjectChange: (newProject: string) => void;
    embedded?: boolean;
}

function ProjectView({ projectId, onProjectChange, embedded = false }: ProjectViewProps) {
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [annotations, setAnnotations] = useState([]);
    const [slide, setSlide] = useState<Image | null>(null);
    const [tabIndex, setTabIndex] = useState(0);
    const sidebarVisible = useRecoilValue(sidebarVisibleState);

    const onSlideChange = (newSlide: Image) => {
        if (projectData) {
            for (const slide of Array.from(projectData.images)) {
                if (slide.entryID === newSlide.entryID) {
                    setAnnotations(JSON.parse(slide.annotations || "[]"));

                    break;
                }
            }

            setTabIndex(1);
            setSlide(newSlide);
        }
    };

    useEffect(() => {
        fetchProjectData(projectId)
            .then(data => {
                setProjectData(data);
            }).catch(e => {
                setProjectData(null);

                if (e instanceof Error) {
                    toast.error(e.message);
                } else {
                    toast.error("Error while loading project.");
                    console.error(e);
                }
            });
    }, [projectId]);

    return (
        <main className="flex flex-grow p-2 gap-2 overflow-hidden">
            {sidebarVisible ? (
                <ProjectViewSidebar 
                    slide={slide}
                    projectId={projectId}
                    projectData={projectData}
                    embedded={embedded}
                    annotations={annotations}
                    onProjectChange={onProjectChange}
                    onSlideChange={onSlideChange}
                />
            ) : (
                <ToggleSidebar />
            )}

            <div className="flex-grow border rounded-sm shadow-lg bg-white">
                { /* Wihout forceRenderTabPanel the tabs will reset when focusing and unfocusing tabs */ }
                <Tabs className="h-full" selectedIndex={tabIndex} onSelect={index => setTabIndex(index)} forceRenderTabPanel>
                    <TabList>
                        <Tab>Project Information</Tab>
                        <Tab>Viewer</Tab>
                    </TabList>

                    { /* TODO: Fix CSS. 44 px is the height of the tab header */ }
                    <TabPanel style={{height: "calc(100% - 44px)"}}>
                        <ProjectInformation data={projectData} />
                    </TabPanel>

                    { /* TODO: Fix CSS. 44 px is the height of the tab header */ }
                    <TabPanel style={{height: "calc(100% - 44px)"}}>
                        <Viewer slide={slide} annotations={annotations} />
                    </TabPanel>
                </Tabs>
            </div>
        </main>
    );
}

export default ProjectView;
