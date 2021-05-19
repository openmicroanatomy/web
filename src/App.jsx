import React, { useState } from "react";
import "tailwindcss/tailwind.css"
import ProjectView from "./components/ProjectView";
import OrganizationSelector from "./components/OrganizationSelector";
import ProjectSelector from "./components/ProjectSelector";

const App = () => {
    const [ project, setProject ] = useState(null);
    const [ organization, setOrganization ] = useState(null);

    const OnOrganizationChange = (newOrganization) => {
        console.log("OnOrganizationChange");
        setOrganization(newOrganization);
    };

    const OnProjectChange = (newProject) => {
        console.log("OnProjectChange");
        setProject(newProject);
    };

    return (
        <div className="App" class="mx-auto font-mono h-screen">
            <div class="bg-blue-500 p-2">
                <p class="text-white font-bold text-lg text-center">For the complete experience download QuPath Edu <a href="#" class="underline">here</a></p>
            </div>

            {project !== null ?
                <ProjectView project={project} />
            :
                <header className="App-header" class="mx-auto w-64 space-y-12 mt-4">
                    <h1 class="text-xl">QuPath Edu Viewer</h1>
                    <OrganizationSelector OnOrganizationChange={OnOrganizationChange} />
                    <ProjectSelector organization={organization} OnProjectChange={OnProjectChange} />
                </header>
            }
        </div>
    );
};

export default App;
