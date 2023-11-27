import { fetchProjectData } from "lib/api";
import { currentSlideState, selectedAnnotationState, slideTourState } from "lib/atoms";
import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import "styles/Scrollbar.css";
import "styles/Sidebar.css";
import "styles/Tabs.css";
import { Project, Slide, SlideTourEntry, Annotation } from "types";
import ProjectInformation from "./ProjectInformation";
import ProjectViewSidebar from "./ProjectViewSidebar";
import Viewer from "./Viewer";
import { useMediaQuery } from "react-responsive";
import Annotations from "./Annotations";
import Slides from "./Slides";
import { AnnotationDetail } from "./AnnotationDetail";
import { AnnotationIcon, ArrowLeftIcon, CollectionIcon, PhotographIcon, QuestionMarkCircleIcon} from "@heroicons/react/outline";
import SlideTour from "./SlideTour";
import { base64DecodeUnicode, legacyBase64Decode } from "../lib/helpers";

function parseSlideTourEntries(slide: Slide): SlideTourEntry[] {
    try {
        if (slide.slideTour && slide.slideTour.length > 0) {
            const data = Array.isArray(slide.slideTour) ? legacyBase64Decode(slide.slideTour) : base64DecodeUnicode(slide.slideTour);

            return JSON.parse(data) as SlideTourEntry[];
        }
    } catch (e) {
        console.error("Error while loading slide tour", e);
    }

    return [];
}

type Props = {
    projectId: string;
    onProjectChange: (newProject: string) => void;
    embedded?: boolean;
}

export default function ProjectView({ projectId, onProjectChange, embedded = false }: Props) {
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [annotations, setAnnotations] = useState<Annotation[]>();
    const [tabIndex, setTabIndex] = useState(0);

    const slide = useRecoilValue(currentSlideState);
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);
    const [slideTour, setSlideTour] = useRecoilState(slideTourState);

    // Same as Tailwind 'lg'
    const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });

    useEffect(() => {
        if (!projectData || !slide) return;

        setSelectedAnnotation(null);
        setAnnotations(JSON.parse(slide.annotations || "[]"));
        setSlideTour({
            active: false,
            index: 0,
            entries: parseSlideTourEntries(slide)
        });

        // Open the Viewer tab when opening a slide.
        setTabIndex(isMobile ? 3 : 1);
    }, [slide]);

    useEffect(() => {
        // Switch to Viewer tab on Mobile when starting a slide tour / selecting a annotation
        if (isMobile && (selectedAnnotation || slideTour.active)) {
            setTabIndex(3);
        }
    }, [selectedAnnotation, slideTour])

    useEffect(() => {
        (async () => {
            try {
                setProjectData(await fetchProjectData(projectId));
            } catch (e) {
                toast.error(`Error while loading project (${e instanceof Error ? e.message : "Unknown error"}`);
                console.error(e);
            }
        })();
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
        <main className="flex h-full shadow-lg">
            <ProjectViewSidebar
                projectId={projectId}
                projectData={projectData}
                embedded={embedded}
                onProjectChange={onProjectChange}
            />

            <div className="flex-grow overflow-hidden rounded-r-lg">
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
