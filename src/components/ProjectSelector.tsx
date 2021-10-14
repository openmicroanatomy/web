import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchWorkspaces } from "../lib/api";
import { Subject, Workspace } from "../types";

interface ProjectSelectorProps {
    organizationId: string;
    onProjectChange: (newProject: string) => void;
}

function ProjectSelector({ organizationId, onProjectChange }: ProjectSelectorProps) {
    const [subjects, setSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        const apiHelper = async () => {
            try {
                const result = await fetchWorkspaces();
                result.forEach((workspace: Workspace) => {
                    if (workspace.owner.id === organizationId) {
                        setSubjects(workspace.subjects);
                    }
                });
            } catch (e) {
                setSubjects([]);
                if (e instanceof Error) {
                    toast.error(e.message);
                }
            }
        };

        apiHelper();
    }, [organizationId]);

    if (subjects.length === 0) {
        return <p>No subjects</p>;
    }

    return (
        <div className="ProjectSelector">
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
