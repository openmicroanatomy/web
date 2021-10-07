import React, { useEffect, useState } from "react";

function Viewer({ slide, annotations }) {
    const [ viewer, setViewer ] = useState(null);
    const [ error, setError ] = useState(null);

    useEffect(() => {
        var viewer = window.OpenSeadragon({
            id: "Viewer",
            prefixUrl: "assets/images/",
            defaultZoomLevel: 0,
            //debugMode: process.env.NODE_ENV !== "production",
            showNavigator: true,
            navigatorSizeRatio: 0.15,
            showNavigationControl: false
        });

        setViewer(viewer);
    }, []);

    useEffect(() => {
        if (!(slide)) {
            return;
        }

        fetch("http://yli-hallila.fi:7777/api/v0/slides/" + slide)
            .then(res => res.json())
            .then(
            (result) => {
                var downsamples = [];
                var levelCount = parseInt(result["openslide.level-count"])

                var slideHeight = parseInt(result["openslide.level[0].height"]);
                var slideWidth  = parseInt(result["openslide.level[0].width"]);

                var tileHeight = parseInt(result["openslide.level[0].tile-width"]);
                var tileWidth  = parseInt(result["openslide.level[0].tile-height"]);

                for (let i = 0; i < levelCount; i++) {
                    downsamples.push(Math.floor(result["openslide.level[" + i + "].downsample"]))
                }

                viewer.open({
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
    
                        if ((tileX + downsample * tileWidth) > slideWidth) {
                            adjustX = tileWidth - Math.floor(Math.abs((tileX - slideWidth) / downsample));
                        }
    
                        if ((tileY + downsample * tileHeight) > slideHeight) {
                            adjustY = tileHeight - Math.floor(Math.abs((tileY - slideHeight) / downsample));
                        }
    
                        var height = tileHeight - adjustY;
                        var width  = tileWidth  - adjustX;
    
                        return result["openslide.remoteserver.uri"]
                                    .replace("{tileX}", tileX)
                                    .replace("{tileY}", tileY)
                                    .replace("{level}", level)
                                    .replace("{tileWidth}", width)
                                    .replace("{tileHeight}", height)
                    }
                });
                
                // This could also be openslide.mpp-x or openslide.mpp-y 
                // TODO: Create fallback aperio.MPP does not exist
                const mpp = parseFloat(result["aperio.MPP"]);

                viewer.scalebar({
                    xOffset: 10,
                    yOffset: 10,
                    barThickness: 3,
                    color: '#555555',
                    fontColor: '#333333',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    pixelsPerMeter: mpp ? (1e6 / mpp) : 0
                });

                const overlay = viewer.svgOverlay();

                window.d3.select(overlay.node()).selectAll("*").remove();

                Array.from(annotations).forEach(annotation => {
                    if (annotation.geometry.type === "LineString") {
                        drawLine(annotation.geometry.coordinates);
                    } else if (annotation.geometry.type === "Polygon") {
                        drawPolygon(annotation.geometry.coordinates[0]);
                    }
                });

                function drawLine(coordinates) {
                    window.d3.select(overlay.node()).append("line")
                        .style('stroke', '#f00')
                        .style("stroke-width", 0.001)
                        .attr("x1", scaleX(coordinates[0][0]))
                        .attr("y1", scaleY(coordinates[0][1]))
                        .attr("x2", scaleX(coordinates[1][0]))
                        .attr("y2", scaleY(coordinates[1][1]));
                }

                function drawPolygon(coordinates) {
                    window.d3.select(overlay.node()).append("polygon")
                        .style('stroke', '#f00')
                        .style("stroke-width", 0.001)
                        .style("fill", "transparent")
                        .attr("points", function(point) { 
                            return coordinates.map(function(point) {
                                return [scaleX(point[0]), scaleY(point[1])].join(",");
                            }).join(" ");
                        });
                }

                function scaleX(x) {
                    return x / slideWidth;
                }

                function scaleY(y) {
                    return y / slideHeight;
                }
            },
            (error) => {
                setError(error);
            }
        )
    }, [ slide ]);

    if (error) {
        return "Error with Viewer";
    }

    return (
        <div id="Viewer" class="h-full w-full" />
    );
};

export default Viewer;
