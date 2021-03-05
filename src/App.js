import React, { Component } from "react";
import Modal from 'react-modal';
import './App.css';
import Viewer from "./components/Viewer";
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
      <div className="App">
        {this.state.project !== null ?
          <Viewer project={this.state.project} />
        :
          <header className="App-header">
            <OrganizationSelector onUpdate={this.OnOrganizationChange} />

            <ProjectSelector organization={this.state.organization} onUpdate={this.OnProjectChange} />
          </header>
        }
         
          {/* <br />

          <button onClick={this.login}>Continue as guest</button>
          <button onClick={this.login}>Login using Microsoft</button>
          
          <br />

          <input type="text" name="username" placeholder="Username"></input>
          <input type="text" name="password" placeholder="Password"></input>

          <button onClick={this.login}>Login</button> */}
      </div>
    );
  }
}

export default App;
