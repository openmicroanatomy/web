import { fetchProjectData } from "lib/api";
import { currentSlideState, selectedAnnotationState, sidebarVisibleState, slideTourState } from "lib/atoms";
import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import "styles/Scrollbar.css";
import "styles/Sidebar.css";
import "styles/Tabs.css";
import { ProjectData, Image, SlideTourEntry, Annotation } from "types";
import ToggleSidebar from "./project/ToggleSidebar";
import ProjectInformation from "./ProjectInformation";
import ProjectViewSidebar from "./ProjectViewSidebar";
import Viewer from "./Viewer";
import { useMediaQuery } from "react-responsive";
import Annotations from "./Annotations";
import Slides from "./Slides";
import { AnnotationDetail } from "./AnnotationDetail";
import { AnnotationIcon, ArrowLeftIcon, CollectionIcon, PhotographIcon, QuestionMarkCircleIcon} from "@heroicons/react/outline";
import SlideTour from "./SlideTour";

interface ProjectViewProps {
    projectId: string;
    onProjectChange: (newProject: string) => void;
    embedded?: boolean;
}

function ProjectView({ projectId, onProjectChange, embedded = false }: ProjectViewProps) {
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [annotations, setAnnotations] = useState<Annotation[]>();
    const slide = useRecoilValue(currentSlideState);
    const [tabIndex, setTabIndex] = useState(0);
    const sidebarVisible = useRecoilValue(sidebarVisibleState);
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);

    /* Slide Tours */
    const [slideTour, setSlideTour] = useRecoilState(slideTourState);

    // Same as Tailwind 'lg'
    const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });

    // See: https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
    const base64DecodeUnicode = (str: string) => {
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    /**
     * @Deprecated to be removed in version 1.1
     */
    const legacyBase64Decode = (data: number[]) => {
        try {
            return atob(data.map(byte => String.fromCharCode(byte)).join(''));
        } catch (e) {
            return new TextDecoder("utf-8").decode(new Uint8Array(data));
        }
    }

    const loadSlideTour = (slide: Image) => {
        let entries: SlideTourEntry[] = [];

        try {
            if (slide.slideTour && slide.slideTour.length > 0) {
                const data = Array.isArray(slide.slideTour) ? legacyBase64Decode(slide.slideTour) : base64DecodeUnicode(slide.slideTour);

                entries = JSON.parse(data) as SlideTourEntry[];
            }
        } catch (e) {
            console.error("Error while loading slide tour", e)
        }

        setSlideTour({
            active: false,
            index: 0,
            entries: entries
        })
    }

    useEffect(() => {
        if (!projectData || !slide) return;

        setSelectedAnnotation(null);
        setAnnotations(JSON.parse(slide.annotations || "[]"));
        loadSlideTour(slide);
        setTabIndex(isMobile ? 3 : 1);
    }, [slide]);

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

    useEffect(() => {
        // Switch to Viewer tab on Mobile when starting a Slide Tour
        if (slideTour.active && isMobile) {
            setTabIndex(3);
        }
    }, [slideTour]);

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

                    <Slides slides={projectData?.images} />
                </TabPanel>

                <TabPanel className="react-tabs__tab-panel flex-grow">
                    <ProjectInformation data={projectData} />
                </TabPanel>

                <TabPanel className="react-tabs__tab-panel flex-grow overflow-y-scroll">
                    <SlideTour />

                    { !slideTour.active && <Annotations annotations={annotations} /> }
                </TabPanel>

                { /* Without forceRender Viewer position will reset when changing tabs*/ }
                <TabPanel className="react-tabs__tab-panel react-tabs__tab-panel-viewer flex flex-col flex-grow" forceRender>
                    <Viewer slide={slide} />

                    { slideTour.active ? <SlideTour /> : <AnnotationDetail /> }
                </TabPanel>
            </Tabs>
        );
    }

    return (
        <main className="flex h-full p-2 gap-2 overflow-hidden">
            {sidebarVisible ? (
                <ProjectViewSidebar
                    projectId={projectId}
                    projectData={projectData}
                    embedded={embedded}
                    onProjectChange={onProjectChange}
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

                    <TabPanel className="react-tabs__tab-panel flex-grow bg-gray-50">
                        <ProjectInformation data={projectData} />
                    </TabPanel>

                    { /* Without forceRender Viewer position will reset when changing tabs */ }
                    <TabPanel className="react-tabs__tab-panel flex-grow" forceRender>
                        <Viewer slide={slide} />
                    </TabPanel>
                </Tabs>
            </div>
        </main>
    );
}

export default ProjectView;
