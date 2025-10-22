import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import Annotations from "./Annotations";
import EmbedProjectPopup from "./project/EmbedProjectPopup";
import ToggleSidebar from "./project/ToggleSidebar";
import Slides from "./Slides";
import { useStore } from "../lib/StateStore";

type Props = {
    embedded: boolean;
}

export default function ProjectViewSidebar({ embedded }: Props) {
    const [ setLessonSelectorModalVisible, sideBarVisible, setSidebarVisible, slide ] = useStore(state => [
        state.setLessonSelectorModalVisible, state.sidebarVisible, state.setSidebarVisible, state.slide
    ]);

    return (
        <div
            className={`w-1/4 border-r rounded-l-lg overflow-hidden ${sideBarVisible ? "bg-gray-50" : "w-4 bg-gray-100 cursor-pointer"} transition-all ease-in-out duration-500`}
            onClick={() => sideBarVisible ? null : setSidebarVisible(true) }
        >
            <div className={`flex flex-col transition h-full max-h-full duration-500 ${sideBarVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <div className="flex justify-between p-2 bg-white">
                    { !embedded &&
                        <a className="cursor-pointer font-mono font-semibold text-slate-600" onClick={() => setLessonSelectorModalVisible(true)}>
                            &laquo; Change lessons
                        </a>
                    }

                    <div className="flex justify-end gap-1">
                        <ToggleSidebar />

                        <EmbedProjectPopup slide={slide} />
                    </div>
                </div>

                <Tabs className="flex flex-col flex-grow overflow-y-hidden">
                    <TabList>
                        <Tab>Slides</Tab>
                        <Tab>Annotations</Tab>
                    </TabList>

                    <TabPanel className="react-tabs__tab-panel h-full overflow-y-auto scrollbar bg-gray-50" forceRender>
                        <Slides />
                    </TabPanel>

                    <TabPanel className="react-tabs__tab-panel h-full overflow-y-auto scrollbar bg-gray-50" forceRender>
                        <Annotations />
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    );
}
