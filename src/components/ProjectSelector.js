import React, { useEffect, useState } from "react";

function ProjectSelector({ organization, OnProjectChange }) {
    const [subjects, setSubjects] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        setSubjects([]);

        fetch("http://yli-hallila.fi:7777/api/v0/workspaces")
            .then(res => res.json())
            .then(
                (result) => {
                    result.forEach(element => {
                        if (element.owner.id === organization) {
                            setSubjects(element.subjects);
                        }
                    });
                },
                (error) => {
                    setSubjects([]);
                    setError(error);
                }
            );
        
    }, [ organization ]);

    if (error) {
        return "Error with ProjectSelector";
    }

    if (subjects.length === 0) {
        return "No subjects";
    }

    return (
        <div className="ProjectSelector">
            {subjects.map(subject => (
                <>
                    <p class="text-xl underline">{subject.name}</p>
                    
                    <ul>
                        {subject.projects.map(project => (
                            <li>
                                <a class="cursor-pointer" onClick={() => OnProjectChange(project.id)}>{project.name}</a>
                            </li>
                        ))}
                    </ul>
                </>
            ))}
        </div>
    );
};

export default ProjectSelector;
