import React, { Component } from "react";

class Project extends Component {
    constructor(props) {

    }

    render() {
        return (
            <div className="Project">
                <Annotations />
                <Viewer />
            </div>
        )
    }
}

export default Project;
