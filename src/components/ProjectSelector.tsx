import { Organization, Workspace } from "types";
import "styles/Scrollbar.css";

interface ProjectSelectorProps {
    workspaces?: Workspace[];
    organization: Organization;
    onProjectChange: (newProject: string) => void;
}

function ProjectSelector({ workspaces, organization, onProjectChange }: ProjectSelectorProps) {
    if (!workspaces) {
        return <p className="font-bold text-center">Loading ...</p>;
    }

    workspaces = workspaces.filter(workspace => workspace.owner.id == organization.id)

    if (workspaces.length === 0) {
        return <p className="font-bold text-center">No workspaces available.</p>;
    }

    return (
        <>
            {workspaces.map((workspace) => (
                <div key={workspace.id}>
                    <p className="text-xl">{workspace.name}</p>

                    {workspace.subjects.map((subject) => (
                        <div key={subject.id}>
                            <p className="text-sm italic">{subject.name}</p>
                            <ul className="list-disc list-inside">
                                {subject.projects
                                    .sort((a, b) => {
                                        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
                                    })
                                    .map((project) => (
                                        <li key={project.id}>
                                            <a className="cursor-pointer" onClick={() => onProjectChange(project.id)}>
                                                {project.name}
                                            </a>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    ))}
                </div>
            ))}
        </>
    );
}

export default ProjectSelector;
