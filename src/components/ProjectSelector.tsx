import "styles/Scrollbar.css";
import { fetchProject } from "../lib/api";
import { useStore } from "../lib/StateStore";
import { useMemo } from "react";

export default function ProjectSelector() {
    const [ server, workspaces, organization, setProject ] = useStore(state => [
      state.server, state.workspaces, state.organization, state.setProject
    ]);

    const filteredWorkspaces = useMemo(() => {
        if (!server || !organization) return [];

        return workspaces.filter(workspace => workspace.owner.id == organization.id)
      }, [server, organization]
    );

    if (!server || !organization) {
        return null;
    }

    if (filteredWorkspaces.length === 0) {
        return <p className="font-bold text-center">No workspaces available.</p>;
    }

    async function onProjectChange(projectId: string) {
        // todo: loading = true

        try {
            const project = await fetchProject(projectId);

            setProject(project);
        } catch (e) {
            console.error("Error while fetching project", e);
        } finally {
            // todo: loading = false
        }
    }

    return (
        <div className="flex flex-col">
            {filteredWorkspaces.map((workspace) => (
                <div key={workspace.id}>
                    <div className="font-bold uppercase p-2 bg-gray-50">
                        {workspace.name}
                    </div>

                    {workspace.subjects.map((subject) => (
                        <div key={subject.id}>
                            <div className="bg-gray-50 p-2 border-b italic">
                                {subject.name}
                            </div>

                            {subject.projects
                                .sort((a, b) => {
                                    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
                                })
                                // todo: check for write access when authentication implemented
                                .filter(project => !(project.hidden))
                                .map((project) => (
                                    <div
                                        key={project.id}
                                        className="p-2 cursor-pointer border-l-4 border-l-transparent border-b hover:border-l-blue-500"
                                        onClick={() => onProjectChange(project.id)}
                                    >
                                        <p>{project.name}</p>
                                        { project.description && <span className="text-sm italic">{project.description}</span> }
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
