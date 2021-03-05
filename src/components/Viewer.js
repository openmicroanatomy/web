import React, { Component } from "react";
import OpenSeadragon from "openseadragon";

class Viewer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            error: null,
            viewer: null
        }

        this.changeView = this.changeView.bind(this);
    }

    componentDidMount() {
        fetch("http://localhost:7777/api/v0/projects/" + this.props.project)
            .then(res => res.json())
            .then(
            (result) => {
                this.setState({
                    data: result
                })
            },
            (error) => {
                this.setState({
                    error
                });
            }
        )
    }

    changeView(uri) {
        let id = new URL(uri).pathname.substr(1);

        fetch("http://localhost:7777/api/v0/slides/" + id)
            .then(res => res.json())
            .then(
            (result) => {
                var downsamples = [];
                var levelCount = parseInt(result["openslide.level-count"])

                var slideWidth = parseInt(result["openslide.level[0].width"]);
                var slideHeight = parseInt(result["openslide.level[0].height"]);

                var tileHeight = parseInt(result["openslide.level[0].tile-width"]);
                var tileWidth  = parseInt(result["openslide.level[0].tile-height"]);

                for (let i = 0; i < levelCount; i++) {
                    downsamples.push(Math.floor(result["openslide.level[" + i + "].downsample"]))
                }

                new OpenSeadragon({
                    id: "Viewer",
                    prefixUrl: "assets/images/",
                    // debugMode: true,
                    flip: true,
                    defaultZoomLevel: 0,
                    tileSources: {
                        width: slideWidth,
                        height: slideHeight,
                        tileHeight: tileHeight,
                        tileWidth: tileWidth,
                        minLevel: 0,
                        maxLevel: levelCount - 1,
                        getLevelScale: function(level) {
                            return 1 / downsamples[levelCount - level - 1];
                        },
                        getTileUrl: function(level, x, y) {
                            level = levelCount - level - 1;

                            var downsample = downsamples[level];
        
                            var adjustY = 0;
                            var adjustX = 0;
        
                            var tileY = y * tileHeight * downsample;
                            var tileX = x * tileWidth  * downsample;

                            console.log(x, y, level);
        
                            if ((tileX + downsample * tileWidth) > slideWidth) {
                                adjustX = tileWidth - Math.floor(Math.abs((tileX - slideWidth) / downsample));
                            }
        
                            if ((tileY + downsample * tileHeight) > slideHeight) {
                                adjustY = tileHeight - Math.floor(Math.abs((tileY - slideHeight) / downsample));
                            }
        
                            var height = tileHeight - adjustY;
                            var width  = tileWidth  - adjustX;
        
                            return "http://localhost:7777/tiles/" + id + "-level-" + level + "-tiles/" + level + "_" + tileX + "_" + tileY + "_" + width + "_" + height + ".jpg"
                        }
                    }
                });
            },
            (error) => {
                // TODO
            }
        )
    }

    render() {
        const { data } = this.state;

        let styles = {
            width: '50vw',
            height: '50vh'
        }

        if (data) {
            return (
                <main>
                    <div id="Slides">
                        {data.id}

                        <h2>Slides</h2>
                        {data.images.map(image => (
                            <div className="Slide">
                                <p onClick={() => this.changeView(image.serverBuilder.uri)}>{image.imageName}</p>
                                <img src={"data:image/png;base64," + image.thumbnail} width="64px" />
                            </div>
                        ))}
                    </div>

                    <div id="Viewer" style={styles} />
                </main>
            );
        } else {
            return "<p>Fetching data ...</p>";
        }
    }
}

export default Viewer;
