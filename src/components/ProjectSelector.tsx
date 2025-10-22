import "styles/Scrollbar.css";
import { fetchProject } from "../lib/api";
import { useStore } from "../lib/StateStore";
import { useEffect, useMemo, useState } from "react";
import { EduSubject } from "../types";

export default function ProjectSelector() {
    const [ setLessonSelectorModalVisible, server, workspaces, organization, currentProject, setProject ] = useStore(state => [
      state.setLessonSelectorModalVisible, state.server, state.workspaces, state.organization, state.project, state.setProject
    ]);

    const [ selectedSubject, setSelectedSubject ] = useState<EduSubject>();

    const filteredWorkspaces = useMemo(() => {
        if (!server || !organization) return [];

        return workspaces.filter(workspace => workspace.owner.id == organization.id)
      }, [server, organization]
    );

    useEffect(() => {
        // Set the default selected subject to the first subject of the first workspace
        if (filteredWorkspaces[0] && filteredWorkspaces[0].subjects[0]) {
            setSelectedSubject(filteredWorkspaces[0].subjects[0]);
        } else {
            setSelectedSubject(undefined);
        }
    }, [filteredWorkspaces]);

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
            setLessonSelectorModalVisible(false);
        } catch (e) {
            console.error("Error while fetching project", e);
        } finally {
            // todo: loading = false
        }
    }

    return (
        <div className="h-full flex-col md:flex-row flex gap-2">
            <div className="flex flex-col p-2 gap-2 md:w-[240px]">
                { filteredWorkspaces.map((workspace) => (
                    <div
                        key={workspace.id}
                        className="flex flex-col gap-2"
                    >
                        <p className="font-semibold text-slate-800 text-sm uppercase">{workspace.name}</p>

                        { workspace.subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className={`flex-shrink ${selectedSubject?.id == subject.id && "bg-gray-100"} p-2 text-slate-800 cursor-pointer hover:bg-gray-100 rounded`}
                                onClick={() => setSelectedSubject(subject)}
                            >
                                <p>{subject.name}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <hr className="md:hidden" />

            <div className="flex flex-col flex-grow border-l gap-2 ml-2 py-2 pr-2 overflow-y-auto scrollbar">
                { selectedSubject?.projects
                    .sort((a, b) => {
                        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
                    })
                    // todo: check for write access when authentication implemented
                    .filter(project => !(project.hidden))
                    .map((project) => (
                        <div
                            key={project.id}
                            className="flex items-center w-full"
                        >
                            <div className="flex min-w-[10px] h-[1px] bg-gray-300" />
                            <div
                                className={`flex-grow ${currentProject?.id === project.id && "bg-gray-100"} hover:bg-gray-100 rounded p-2 cursor-pointer`}
                                onClick={() => onProjectChange(project.id)}
                            >
                                <p className="text-slate-800">{project.name}</p>
                                { project.description && <span className="text-sm italic">{project.description}</span> }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
