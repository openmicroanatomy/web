import { fetchProjectData } from "lib/api";
import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { toast } from "react-toastify";
import "styles/Tabs.css";
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
        <main className="flex flex-wrap flex-grow p-4 h-full">
            {projectData && (
                <>
                    <div className="w-1/4 border">
                        <a className="p-4 italic cursor-pointer" onClick={() => onProjectChange("")}>
                            &lt; return to projects
                        </a>
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

                    <div className="w-3/4 border">
                        <Viewer slideId={slide} annotations={annotations} />
                    </div>
                </>
            )}
        </main>
    );
}

export default ProjectView;
