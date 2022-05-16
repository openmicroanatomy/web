import { fetchWorkspaces } from "lib/api";
import { useEffect, useState } from "react";
import { Subject, Workspace } from "types";
import "styles/Scrollbar.css";

interface ProjectSelectorProps {
    organizationId: string;
    onProjectChange: (newProject: string) => void;
}

function ProjectSelector({ organizationId, onProjectChange }: ProjectSelectorProps) {
    const [subjects, setSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        if (!organizationId) {
            return;
        }

        setSubjects([]);

        const apiHelper = async () => {
            try {
                const result = (await fetchWorkspaces()) as Workspace[];
                const workspace = result.find((workspace) => workspace.owner.id === organizationId);

                if (workspace) {
                    setSubjects(workspace.subjects.sort((a, b) => a.name.localeCompare(b.name)));
                }
            } catch {
                setSubjects([]);
            }
        };

        apiHelper();
    }, [organizationId]);

    if (subjects.length === 0) {
        return (
            <div id="ProjectSelector">
                <p className="font-bold">No subjects</p>
            </div>
        );
    }

    return (
        <div id="ProjectSelector" className="overflow-y-auto scrollbar">
            {subjects.map((subject) => (
                <span key={subject.id}>
                    <p className="text-xl italic">{subject.name}</p>
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
                            ))}
                    </ul>
                </span>
            ))}
        </div>
    );
}

export default ProjectSelector;
