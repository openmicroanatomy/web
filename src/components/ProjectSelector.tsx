import { EduOrganization, EduWorkspace } from "types";
import "styles/Scrollbar.css";

type Props = {
    workspaces?: EduWorkspace[];
    organization: EduOrganization;
    onProjectChange: (newProject: string) => void;
}

export default function ProjectSelector({ workspaces, organization, onProjectChange }: Props) {
    if (!workspaces) {
        return <p className="font-bold text-center text-slate-600">Loading ...</p>;
    }

    workspaces = workspaces.filter(workspace => workspace.owner.id == organization.id)

    if (workspaces.length === 0) {
        return <p className="font-bold text-center">No workspaces available.</p>;
    }

    return (
        <div className="flex flex-col">
            {workspaces.map((workspace) => (
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
                                .map((project) => (
                                    <div
                                        key={project.id}
                                        className="p-2 cursor-pointer border-l-4 border-l-transparent border-b hover:border-l-blue-500"
                                        onClick={() => onProjectChange(project.id)}
                                    >
                                        {project.name}
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
