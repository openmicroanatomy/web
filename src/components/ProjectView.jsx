import React, { Component } from "react";
import Slides from "./Slides";
import Annotations from "./Annotations";
import Viewer from "./Viewer";

class ProjectView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            project: null,
            error: null,
            slide: null,
            annotations: []
        }

        this.OnSlideChange = this.OnSlideChange.bind(this);
    }

    componentDidMount() {
        fetch("http://localhost:7777/api/v0/projects/" + this.props.project)
            .then(res => res.json())
            .then(
            (result) => {
                this.setState({
                    project: result
                })
            },
            (error) => {
                this.setState({
                    error
                });
            }
        )
    }

    OnSlideChange(newSlide) {
        Array.from(this.state.project.images).forEach(image => {
            if (image.serverBuilder.uri === newSlide) {
                if (image.annotations != null) {
                    this.setState({
                        annotations: JSON.parse(image.annotations)
                    });
                } else {
                    this.setState({
                        annotations: []
                    });
                }
            }
        });

        this.setState({
            slide: new URL(newSlide).pathname.substr(1)
        })
    }

    render() {
        return (
            <main class="flex flex-wrap flex-grow p-4 h-full">
                <div class="w-1/4 border">
                    <a class="p-4 italic cursor-pointer">&lt; return to projects</a>

                    <Slides slides={this.state.project?.images} OnChange={this.OnSlideChange} />
                    <Annotations annotations={this.state.annotations} />
                </div>
                <div class="w-3/4 border">
                    <Viewer slide={this.state.slide} annotations={this.state.annotations} />
                </div>
            </main>
        )
    }
}

export default ProjectView;
