import { fetchProjectData } from "lib/api";
import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { toast } from "react-toastify";
import "styles/Tabs.css";
import "styles/Scrollbar.css";
import { ProjectData } from "types";
import Annotations from "./Annotations";
import Slides from "./Slides";
import Viewer from "./Viewer";

interface ProjectViewProps {
    projectId: string;
    onProjectChange: (newProject: string) => void;
}

function ProjectView({ projectId, onProjectChange }: ProjectViewProps) {
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [annotations, setAnnotations] = useState([]);
    const [slide, setSlide] = useState("");
    const [sidebarVisible, setSidebarVisible] = useState(true);

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
                            <div className="px-2 italic">
                                <a className="cursor-pointer" onClick={() => onProjectChange("")}>
                                    return to projects
                                </a>

                                <a className="float-right cursor-pointer" onClick={() => setSidebarVisible((o) => !o)}>
                                    &laquo; hide
                                </a>
                            </div>

                            <Tabs>
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
                            className="cursor-pointer border rounded-sm p-1"
                            onClick={() => setSidebarVisible((o) => !o)}
                        >
                            &raquo;
                        </a>
                    )}

                    <div className="flex-grow border rounded-sm shadow-lg bg-white">
                        <Viewer slideId={slide} annotations={annotations} />
                    </div>
                </>
            )}
        </main>
    );
}

export default ProjectView;
