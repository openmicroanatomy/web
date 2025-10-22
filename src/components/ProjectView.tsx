import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "styles/Scrollbar.css";
import "styles/Sidebar.css";
import "styles/Tabs.css";
import ProjectInformation from "./ProjectInformation";
import ProjectViewSidebar from "./ProjectViewSidebar";
import Viewer from "./Viewer";
import { useMediaQuery } from "react-responsive";
import Annotations from "./Annotations";
import Slides from "./Slides";
import { AnnotationDetail } from "./AnnotationDetail";
import { ArrowLeftIcon, ChatBubbleBottomCenterIcon, PhotoIcon, QuestionMarkCircleIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import SlideTour from "./SlideTour";
import { parseSlideTourEntries } from "../lib/helpers";
import { useStore } from "../lib/StateStore";

type Props = {
    embedded?: boolean;
}

export default function ProjectView({ embedded = false }: Props) {
    const [tabIndex, setTabIndex] = useState(0);

    const [ setLessonSelectorModalVisible, slide, selectedAnnotation, setSelectedAnnotation, slideTour, setSlideTour] = useStore(state => [
      state.setLessonSelectorModalVisible, state.slide, state.selectedAnnotation, state.setSelectedAnnotation, state.slideTour, state.setSlideTour
    ]);

    // Same as Tailwind 'lg'
    const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });

    useEffect(() => {
        if (!slide) return;

        setSelectedAnnotation(null);
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

    if (isMobile) {
        return (
            <Tabs className="h-full flex flex-col-reverse overflow-hidden" selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                <TabList className="react-tabs__tab-list">
                    <Tab>
                        <RectangleStackIcon className="w-5 h-5 m-auto" />
                        <p>Slides</p>
                    </Tab>

                    <Tab>
                        <QuestionMarkCircleIcon className="w-5 h-5 m-auto" />
                        <p>Information</p>
                    </Tab>

                    <Tab>
                        <ChatBubbleBottomCenterIcon className="w-5 h-5 m-auto" />
                        <p>Annotations</p>
                    </Tab>
                    <Tab>
                        <PhotoIcon className="w-5 h-5 m-auto" />
                        <p>Viewer</p>
                    </Tab>
                </TabList>

                <TabPanel className="react-tabs__tab-panel overflow-y-scroll flex-grow">
                    <a className="sticky top-0 bg-white p-3 border-b-2 block cursor-pointer font-bold" onClick={() => setLessonSelectorModalVisible(true)}>
                        <ArrowLeftIcon className="w-4 h-4 inline-block h:translate-x-2" /> Return to lessons
                    </a>

                    <Slides />
                </TabPanel>

                <TabPanel className="react-tabs__tab-panel flex-grow">
                    <ProjectInformation />
                </TabPanel>

                <TabPanel className="react-tabs__tab-panel flex-grow overflow-y-scroll">
                    <SlideTour isMobile />

                    { !slideTour.active && <Annotations /> }
                </TabPanel>

                { /* Without forceRender Viewer position will reset when changing tabs*/ }
                <TabPanel className="react-tabs__tab-panel react-tabs__tab-panel-viewer flex! flex-col flex-grow" forceRender>
                    <Viewer isMobile />

                    { slideTour.active ? <SlideTour isMobile /> : <AnnotationDetail /> }
                </TabPanel>
            </Tabs>
        );
    }

    return (
        <main className="flex h-full border border-gray-300 rounded-lg">
            <ProjectViewSidebar embedded={embedded} />

            <div className="flex-grow overflow-hidden rounded-r-lg">
                <Tabs className="h-full flex flex-col" selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                    <TabList>
                        <Tab>Information</Tab>
                        <Tab>Viewer</Tab>
                    </TabList>

                    <TabPanel className="react-tabs__tab-panel flex-grow bg-gray-50">
                        <ProjectInformation />
                    </TabPanel>

                    { /* Without forceRender Viewer position will reset when changing tabs */ }
                    <TabPanel className="react-tabs__tab-panel flex-grow" forceRender>
                        <Viewer />
                    </TabPanel>
                </Tabs>
            </div>
        </main>
    );
}
