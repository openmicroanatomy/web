import { EduOrganization, EduWorkspace } from "types";
import "styles/Scrollbar.css";

type Props = {
    workspaces?: EduWorkspace[];
    organization: EduOrganization;
    onProjectChange: (newProject: string) => void;
}

export default function ProjectSelector({ workspaces, organization, onProjectChange }: Props) {
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
                    <p className="font-bold text-xl">{workspace.name}</p>

                    {workspace.subjects.map((subject) => (
                        <div key={subject.id}>
                            <p className="italic">{subject.name}</p>
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
