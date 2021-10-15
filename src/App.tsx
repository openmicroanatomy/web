import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRecoilValue, useSetRecoilState } from "recoil";
import "tailwindcss/tailwind.css";
import HostSelector from "./components/HostSelector";
import OrganizationSelector from "./components/OrganizationSelector";
import ProjectSelector from "./components/ProjectSelector";
import ProjectView from "./components/ProjectView";
import { hostState } from "./lib/atoms";
import { getValue } from "./lib/localStorage";

const App = () => {
    const setHost = useSetRecoilState(hostState);
    const currentHost = useRecoilValue(hostState);
    const [organization, setOrganization] = useState("");
    const [projectId, setProjectId] = useState("");

    useEffect(() => {
        const cachedHost = getValue("qupath_host");
        if (cachedHost) {
            setHost(cachedHost);
        }
    }, []);

    const onOrganizationChange = (newOrganization: string) => {
        setOrganization(newOrganization);
    };

    const onProjectChange = (newProjectId: string) => {
        setProjectId(newProjectId);
    };

    return (
        <div className="App mx-auto font-mono h-screen bg-gray-100">
            <ToastContainer />
            <div className="bg-blue-500 p-2">
                <p className="text-white font-bold text-lg text-center">
                    For the complete experience download QuPath Edu{" "}
                    <a href="#" className="underline">
                        here
                    </a>
                </p>
            </div>

            {projectId ? (
                <ProjectView projectId={projectId} onProjectChange={onProjectChange} />
            ) : (
                <div className="App-header mx-auto w-72 space-y-12 mt-4">
                    <header className="App-header mx-auto w-72 space-y-12 mt-4">
                        <h1 className="text-3xl">QuPath Edu Cloud</h1>
                    </header>
                    
                    <HostSelector />

                    {currentHost ? (
                        <>
                            <OrganizationSelector onOrganizationChange={onOrganizationChange} />
                            <ProjectSelector organizationId={organization} onProjectChange={onProjectChange} />
                        </>
                    ) : null }
                </div>
            )}
        </div>
    );
};

export default App;
