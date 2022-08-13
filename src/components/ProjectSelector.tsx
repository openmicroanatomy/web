import { Subject } from "types";
import "styles/Scrollbar.css";

interface ProjectSelectorProps {
    subjects: Subject[];
    onProjectChange: (newProject: string) => void;
}

function ProjectSelector({ subjects, onProjectChange }: ProjectSelectorProps) {
    if (subjects.length === 0) {
        return <p className="font-bold text-center">No subjects</p>;
    }

    return (
        <div>
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
                            ))
                        }
                    </ul>
                </span>
            ))}
        </div>
    );
}

export default ProjectSelector;
