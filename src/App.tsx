import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "tailwindcss/tailwind.css";
import HostSelector from "./components/HostSelector";
import OrganizationSelector from "./components/OrganizationSelector";
import ProjectSelector from "./components/ProjectSelector";
import ProjectView from "./components/ProjectView";

const App = () => {
    const [organization, setOrganization] = useState("");
    const [projectId, setProjectId] = useState("");

    const onOrganizationChange = (newOrganization: string) => {
        setOrganization(newOrganization);
    };

    const onProjectChange = (newProjectId: string) => {
        setProjectId(newProjectId);
    };

    return (
        <div className="App mx-auto font-mono h-screen">
            <ToastContainer />
            <div className="bg-blue-500 p-2">
                <p className="text-white font-bold text-lg text-center">
                    For the complete experience download QuPath Edu{" "}
                    <a href="#" className="underline">
                        here
                    </a>
                </p>
            </div>

            <header className="App-header mx-auto w-72 space-y-12 mt-4">
                <h1 className="text-3xl">QuPath Edu Cloud</h1>
                <HostSelector />
            </header>

            {projectId !== "" ? (
                <ProjectView projectId={projectId} onProjectChange={onProjectChange} />
            ) : (
                <div className="App-header mx-auto w-72 space-y-12 mt-4">
                    <OrganizationSelector onOrganizationChange={onOrganizationChange} />
                    <ProjectSelector organizationId={organization} onProjectChange={onProjectChange} />
                </div>
            )}
        </div>
    );
};

export default App;
