import { fetchProjectData } from "lib/api";
import { hostState } from "lib/atoms";
import { useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { toast } from "react-toastify";
import { getRecoil } from "recoil-nexus";
import "styles/Scrollbar.css";
import "styles/Sidebar.css";
import "styles/Tabs.css";
import { Host, ProjectData } from "types";
import Annotations from "./Annotations";
import PopupLarge from "./PopupLarge";
import ProjectInformation from "./ProjectInformation";
import Slides from "./Slides";
import Viewer from "./Viewer";

interface ProjectViewProps {
    projectId: string;
    onProjectChange: (newProject: string) => void;
    embedded?: boolean;
}

function ProjectView({ projectId, onProjectChange, embedded = false }: ProjectViewProps) {
    const [projectData, setProjectData] = useState<ProjectData | null>(null);
    const [annotations, setAnnotations] = useState([]);
    const [slide, setSlide] = useState("");
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const host = getRecoil(hostState);

    const EmbedFrameTemplate = (data: string) => { // TODO: remove trailing tabs
        return `<iframe
            class="embedded-qupath-slide"
            src="https://edu.qupath.yli-hallila.fi/#!/embed/` + data + `"
            width="1200px"
            height="600px"
            loading="lazy"
            allow="fullscreen"
            style="border: 1px solid #ccc"></iframe>`
    }

    const HostToReadable = (host: Host | null) => {
        if (host && host.host) {
            return host.host
                .replace("https://", "")
                .replace("http://", "");
        }

        return "";
    }

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
                            <div className="sticky top-0">
                                <div className="flex justify-between sticky top-0 p-2 bg-white">
                                    { !embedded && 
                                        <a className="cursor-pointer" onClick={() => onProjectChange("")}>
                                            Return to projects
                                        </a>
                                    }

                                    <div className="flex justify-end gap-1">
                                        <a className="rounded--button" onClick={() => setSidebarVisible((o) => !o)}>
                                            &laquo;
                                        </a>

                                        <PopupLarge 
                                            activator={
                                                <a className="rounded--button">&lt;&gt;</a>   
                                            }
                                        >
                                            <h2 className="font-bold italic">Embed current project</h2>
                                            <pre className="border whitespace-pre-wrap bg-slate-50 rounded p-2">{ EmbedFrameTemplate(HostToReadable(host) + "/" + projectId) }</pre>

                                            <h2 className="font-bold italic">Embed current slide</h2>
                                            { slide ? 
                                                <pre className="border whitespace-pre-wrap bg-slate-50 rounded p-2">{ EmbedFrameTemplate(HostToReadable(host) + "/" + projectId + "/" + slide) }</pre>
                                            :
                                                <p>No slide currently opened</p>    
                                            }
                                        </PopupLarge>                                 
                                    </div>
                                </div>
                            </div>

                            <Tabs>
                                <TabList className="flex sticky top-12 border-b bg-white">
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
