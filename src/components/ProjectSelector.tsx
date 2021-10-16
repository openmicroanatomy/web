import { useEffect, useState } from "react";
import { fetchWorkspaces } from "../lib/api";
import { Subject, Workspace } from "../types";

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

        const apiHelper = async () => {
            try {
                const result = await fetchWorkspaces();
                result.forEach((workspace: Workspace) => {
                    if (workspace.owner.id === organizationId) {
                        setSubjects(workspace.subjects);
                    }
                });
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
        <div id="ProjectSelector">
            {subjects.map((subject) => (
                <span key={subject.id}>
                    <p className="text-xl underline">{subject.name}</p>
                    <ul>
                        {subject.projects.map((project) => (
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
