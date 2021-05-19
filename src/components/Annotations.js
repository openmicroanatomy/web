import React, { Component } from "react";

class Annotations extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { annotations } = this.props; 

        return (
            <div id="Annotations">
                {annotations ?
                    <>
                        <p class="text-xl p-4">Annotations</p>

                        {this.props.annotations.map(annotation => (
                            <div class="grid grid-cols-4 p-2 border-b border-t mb-2">
                                <div class="col-span-4">
                                    {annotation.properties.name ?
                                        <p>{annotation.geometry.type}: {annotation.properties.name}</p>
                                    :
                                        <p>{annotation.geometry.type}</p>
                                    }
                                </div>
                            </div>
                        ))}
                    </>
                :
                    <p>No annotations</p>
                }
            </div>
        );
    }
}

export default Annotations;