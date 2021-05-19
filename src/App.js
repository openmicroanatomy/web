import React, { Component } from "react";
import "tailwindcss/tailwind.css"
import ProjectView from "./components/ProjectView";
import OrganizationSelector from "./components/OrganizationSelector";
import ProjectSelector from "./components/ProjectSelector";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      modalIsOpen: false,
      project: null,
      organization: null
    };

    this.login        = this.login.bind(this);
    this.OnOrganizationChange = this.OnOrganizationChange.bind(this);
    this.OnProjectChange      = this.OnProjectChange.bind(this);
  }

  OnOrganizationChange(e) {
    this.setState({
      organization: e.target.value
    });
  }

  OnProjectChange(newProject) {
    this.setState({
      project: newProject
    });
  }

  continueAsGuest(e) {
    this.setState({
      modalIsOpen: true
    })
  }

  login(e) {

  }

  render() {
    return (
      <div className="App" class="mx-auto font-mono h-screen">
        <div class="bg-blue-500 p-2">
          <p class="text-white font-bold text-lg text-center">For the complete experience download QuPath Edu <a href="#" class="underline">here</a></p>
        </div>

        {this.state.project !== null ?
          <ProjectView project={this.state.project} />
        :
          <header className="App-header" class="mx-auto w-64 space-y-12 mt-4">
            <h1 class="text-xl">QuPath Edu Viewer</h1>

            <OrganizationSelector onUpdate={this.OnOrganizationChange} />

            <ProjectSelector organization={this.state.organization} onUpdate={this.OnProjectChange} />
          </header>
        }
      </div>
    );
  }
}

export default App;
