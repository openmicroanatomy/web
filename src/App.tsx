import React, { useState } from "react";
import "tailwindcss/tailwind.css";
import OrganizationSelector from "./components/OrganizationSelector";
import ProjectSelector from "./components/ProjectSelector";
import ProjectView from "./components/ProjectView";

const App = () => {
    const [project, setProject] = useState("");
    const [organization, setOrganization] = useState("");

    const onOrganizationChange = (newOrganization: string) => {
        setOrganization(newOrganization);
    };

    const onProjectChange = (newProject: string) => {
        setProject(newProject);
    };

    return (
        <div className="App mx-auto font-mono h-screen">
            <div className="bg-blue-500 p-2">
                <p className="text-white font-bold text-lg text-center">
                    For the complete experience download QuPath Edu{" "}
                    <a href="#" className="underline">
                        here
                    </a>
                </p>
            </div>

            {project !== "" ? (
                <ProjectView projectId={project} onProjectChange={onProjectChange} />
            ) : (
                <header className="App-header mx-auto w-64 space-y-12 mt-4">
                    <h1 className="text-xl">QuPath Edu Viewer</h1>
                    <OrganizationSelector onOrganizationChange={onOrganizationChange} />
                    <ProjectSelector organizationId={organization} onProjectChange={onProjectChange} />
                </header>
            )}
        </div>
    );
};

export default App;
