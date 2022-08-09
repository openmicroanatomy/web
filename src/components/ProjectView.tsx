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
import { useMediaQuery } from "react-responsive";
import Annotations from "./Annotations";
import Slides from "./Slides";

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

    // Same as Tailwind 'lg'
    const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });

    const onSlideChange = (newSlide: Image) => {
        if (projectData) {
            for (const slide of Array.from(projectData.images)) {
                if (slide.entryID === newSlide.entryID) {
                    setAnnotations(JSON.parse(slide.annotations || "[]"));

                    break;
                }
            }

            setTabIndex(isMobile ? 3 : 1);
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

    if (isMobile) {
        return (
            <main className="h-full overflow-hidden">
                <div className="h-full bg-white">
                    { /* Without forceRenderTabPanel the tabs will reset when focusing and unfocusing tabs */ }
                    <Tabs className="h-full flex flex-col-reverse" selectedIndex={tabIndex} onSelect={index => setTabIndex(index)} forceRenderTabPanel>
                        <TabList>
                            <Tab>Slides</Tab>
                            <Tab>Annotations</Tab>
                            <Tab>Information</Tab>
                            <Tab>Viewer</Tab>
                        </TabList>

                        { /* TODO: Fix CSS. 55 px is the height of the tab header + padding */ }
                        <TabPanel style={ { height: "calc(100% - 55px)"} } className="react-tabs__tab-panel overflow-y-scroll">
                            <>
                                <a className="p-1 cursor-pointer" onClick={() => onProjectChange("")}>
                                    Return to projects
                                </a>

                                <Slides images={projectData?.images} onSlideChange={onSlideChange} />
                            </>
                        </TabPanel>

                        { /* TODO: Fix CSS. 55 px is the height of the tab header + padding */ }
                        <TabPanel style={ { height: "calc(100% - 55px)"} } className="react-tabs__tab-panel overflow-y-scroll">
                            <Annotations annotations={annotations} />
                        </TabPanel>

                        { /* TODO: Fix CSS. 55 px is the height of the tab header + padding */ }
                        <TabPanel style={ { height: "calc(100% - 55px)"} } className="react-tabs__tab-panel">
                            <ProjectInformation data={projectData} />
                        </TabPanel>

                        { /* TODO: Fix CSS. 55 px is the height of the tab header + padding, 16 px is the padding for left and right */ }
                        <TabPanel style={ { width: "calc(100% - 16px)", height: "calc(100% - 55px)"} } className="react-tabs__tab-panel react-tabs__tab-panel-viewer">
                            <Viewer slide={slide} annotations={annotations} />
                        </TabPanel>
                    </Tabs>
                </div>
            </main>
        );
    }

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
                        <Tab>Information</Tab>
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
