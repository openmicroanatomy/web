import React, { Component } from "react";

class OrganizationSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            organizations: [],
        };
    }

    componentDidMount() {
        fetch("http://localhost:7777/api/v0/organizations")
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                organizations: result
              });
            },
            (error) => {
              this.setState({
                error
              });
            }
          )
      }

    render() {
        const { organizations } = this.state.organizations;

        return (
            <div id="OrganizationSelector">
                <p class="text-xl">Select organization</p>

                <select name="organization" onChange={this.props.onUpdate}>
                    <option>Select ...</option>
                    {this.state.organizations.map(organization => (
                        <option value={organization.id}>{organization.name}</option>
                    ))}
                </select>
            </div>
        )
    }
}

export default OrganizationSelector;
