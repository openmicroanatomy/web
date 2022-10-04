import { fetchProjectData } from "lib/api";
import { selectedAnnotationState, sidebarVisibleState } from "lib/atoms";
import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
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
import { AnnotationDetail } from "./AnnotationDetail";
import { AnnotationIcon, ArrowLeftIcon, CollectionIcon, PhotographIcon, QuestionMarkCircleIcon} from "@heroicons/react/outline";

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
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);

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

            setSelectedAnnotation(null);
            setTabIndex(isMobile ? 3 : 1);
            setSlide(newSlide);
        }
    };

    useEffect(() => {
        if (isMobile && slide && selectedAnnotation != null) {
            setTabIndex(3);
        }
    }, [selectedAnnotation])

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
            <Tabs className="h-full flex flex-col-reverse overflow-hidden" selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                <TabList className="react-tabs__tab-list">
                    <Tab>
                        <CollectionIcon className="w-5 h-5 m-auto" />
                        <p>Slides</p>
                    </Tab>

                    <Tab>
                        <QuestionMarkCircleIcon className="w-5 h-5 m-auto" />
                        <p>Information</p>
                    </Tab>

                    <Tab>
                        <AnnotationIcon className="w-5 h-5 m-auto" />
                        <p>Annotations</p>
                    </Tab>
                    <Tab>
                        <PhotographIcon className="w-5 h-5 m-auto" />
                        <p>Viewer</p>
                    </Tab>
                </TabList>

                <TabPanel className="react-tabs__tab-panel overflow-y-scroll flex-grow">
                    <a className="sticky top-0 bg-white p-3 border-b-2 block cursor-pointer font-bold" onClick={() => onProjectChange("")}>
                        <ArrowLeftIcon className="w-4 h-4 inline-block h:translate-x-2" /> Return to lessons
                    </a>

                    <Slides slides={projectData?.images} onSlideChange={onSlideChange} />
                </TabPanel>

                <TabPanel className="react-tabs__tab-panel flex-grow">
                    <ProjectInformation data={projectData} />
                </TabPanel>

                <TabPanel className="react-tabs__tab-panel flex-grow overflow-y-scroll">
                    <Annotations annotations={annotations} />
                </TabPanel>

                { /* Without forceRender Viewer position will reset when changing tabs*/ }
                <TabPanel className="react-tabs__tab-panel react-tabs__tab-panel-viewer flex flex-col flex-grow" forceRender>
                    <Viewer slide={slide} annotations={annotations} />

                    <AnnotationDetail />
                </TabPanel>
            </Tabs>
        );
    }

    return (
        <main className="flex h-full p-2 gap-2 overflow-hidden">
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
                <Tabs className="h-full flex flex-col" selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                    <TabList>
                        <Tab>Information</Tab>
                        <Tab>Viewer</Tab>
                    </TabList>

                    <TabPanel className="react-tabs__tab-panel flex-grow">
                        <ProjectInformation data={projectData} />
                    </TabPanel>

                    { /* Without forceRender Viewer position will reset when changing tabs*/ }
                    <TabPanel className="react-tabs__tab-panel flex-grow" forceRender>
                        <Viewer slide={slide} annotations={annotations} />
                    </TabPanel>
                </Tabs>
            </div>
        </main>
    );
}

export default ProjectView;
