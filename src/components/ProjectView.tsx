import { fetchProjectData } from "lib/api";
import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { toast } from "react-toastify";
import "styles/Tabs.css";
import "styles/Scrollbar.css";
import "styles/Sidebar.css";
import { ProjectData } from "types";
import Annotations from "./Annotations";
import Slides from "./Slides";
import Viewer from "./Viewer";
import ProjectInformation from "./ProjectInformation";

interface ProjectViewProps {
    projectId: string;
    onProjectChange: (newProject: string) => void;
}

function ProjectView({ projectId, onProjectChange }: ProjectViewProps) {
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [annotations, setAnnotations] = useState([]);
    const [slide, setSlide] = useState("");
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);

    const onSlideChange = (newSlide: string) => {
        if (projectData) {
            for (const image of Array.from(projectData.images)) {
                if (image.serverBuilder.uri === newSlide) {
                    if (image.annotations == null) {
                        setAnnotations([]);
                    } else {
                        setAnnotations(JSON.parse(image.annotations));
                    }

                    break;
                }
            }

            setTabIndex(1);
            setSlide(new URL(newSlide).pathname.substr(1));
        }
    };

    useEffect(() => {
        const apiHelper = async () => {
            try {
                const result = await fetchProjectData(projectId);
                setProjectData(result);
            } catch (e) {
                setProjectData(null);
                if (e instanceof Error) {
                    toast.error(e.message);
                }
            }
        };

        apiHelper();
    }, [projectId]);

    return (
        <main className="flex flex-grow p-2 gap-2 overflow-hidden">
            {projectData && (
                <>
                    {sidebarVisible ? (
                        <div className="flex-none w-1/4 border rounded-sm shadow-lg bg-white overflow-y-auto scrollbar">
                            <div className="p-2">
                                <a className="cursor-pointer" onClick={() => onProjectChange("")}>
                                    Return to projects
                                </a>

                                <div className="float-right flex flex-row-reverse">
                                    <a className="rounded--button" onClick={() => setSidebarVisible((o) => !o)}>
                                        &laquo;
                                    </a>

                                    <a className="rounded--button mx-1 flex">
                                        { /* TODO: Implement embed popup dialog */}
                                        <img className="w-4 h-4" src="img/embed.png" alt="Embed" />
                                    </a>                                    
                                </div>
                            </div>

                            <Tabs>
                                { /* Make tab header fixed to top */ }
                                <TabList>
                                    <Tab>Slides</Tab>
                                    <Tab>Annotations</Tab>
                                </TabList>

                                <TabPanel>
                                    <Slides images={projectData.images} onSlideChange={onSlideChange} />
                                </TabPanel>
                                <TabPanel>
                                    <Annotations annotations={annotations} />
                                </TabPanel>
                            </Tabs>
                        </div>
                    ) : (
                        <a
                            className="rounded--button"
                            onClick={() => setSidebarVisible((o) => !o)}
                        >
                            &raquo;
                        </a>
                    )}

                    <div className="flex-grow border rounded-sm shadow-lg bg-white">
                        <Tabs className="h-full" selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
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
                                <Viewer slideId={slide} annotations={annotations} />
                            </TabPanel>
                        </Tabs>

                    </div>
                </>
            )}
        </main>
    );
}

export default ProjectView;
