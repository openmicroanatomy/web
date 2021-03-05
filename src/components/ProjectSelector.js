import React, { Component } from "react";

class ProjectSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subjects: [],
            error: null
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.organization == this.props.organization) {
            return;
        }

        this.setState({
            subjects: []
        });

        fetch("http://localhost:7777/api/v0/workspaces")
            .then(res => res.json())
            .then(
            (result) => {
                result.forEach(element => {
                    if (element.owner.id == this.props.organization) {
                        this.setState({
                            subjects: element.subjects
                        });
                    }
                });
            },
            (error) => {
                this.setState({
                    subjects: [],
                    error
                });
            }
        )
    }


    render() {
        const { subjects } = this.state; 

        if (subjects.length == 0) {
            return null;
        }

        return (
            <div className="ProjectSelector">
                {subjects.map(subject => (
                    <>
                        <p>{subject.name}</p>
                        
                        <ul>
                            {subject.projects.map(project => (
                                <li>
                                    <a onClick={() => this.props.onUpdate(project.id)}>
                                        {project.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </>
                ))}
            </div>
        );
    }
}

export default ProjectSelector;
