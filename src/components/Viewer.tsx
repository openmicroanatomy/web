import { fetchSlide } from "lib/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Annotation, LineString, Polygon } from "types";

interface ViewerProps {
    slideId?: string | null;
    annotations?: Annotation[];
}

function Viewer({ slideId, annotations }: ViewerProps) {
    const [viewer, setViewer] = useState<OpenSeadragon.Viewer | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const viewer = window.OpenSeadragon({
            id: "Viewer",
            prefixUrl: "assets/images/",
            defaultZoomLevel: 0,
            //debugMode: process.env.NODE_ENV !== "production",
            showNavigator: true,
            navigatorSizeRatio: 0.15,
            navigatorAutoFade: false,
            showNavigationControl: false
        });

        setViewer(viewer);
    }, []);

    useEffect(() => {
        if (!slideId || !viewer || !annotations) {
            return;
        }

        // TODO: Refactor this to its own class/functions etc.
        const apiHelper = async () => {
            const result = await fetchSlide(slideId);
            const downsamples: number[] = [];
            const levelCount = parseInt(result["openslide.level-count"]);

            const slideHeight = parseInt(result["openslide.level[0].height"]);
            const slideWidth = parseInt(result["openslide.level[0].width"]);

            const tileHeight = parseInt(result["openslide.level[0].tile-width"]);
            const tileWidth = parseInt(result["openslide.level[0].tile-height"]);

            for (let i = 0; i < levelCount; i++) {
                downsamples.push(Math.floor(result["openslide.level[" + i + "].downsample"]));
            }

            viewer.open({
                height: slideHeight,
                width: slideWidth,
                tileHeight: tileHeight,
                tileWidth: tileWidth,
                minLevel: 0,
                maxLevel: levelCount - 1,
                getLevelScale: function (level: number) {
                    return 1 / downsamples[levelCount - level - 1];
                },
                getTileUrl: function (level: number, x: number, y: number) {
                    level = levelCount - level - 1;

                    const downsample = downsamples[level];

                    let adjustY = 0;
                    let adjustX = 0;

                    const tileY = y * tileHeight * downsample;
                    const tileX = x * tileWidth * downsample;

                    if (tileX + downsample * tileWidth > slideWidth) {
                        adjustX = tileWidth - Math.floor(Math.abs((tileX - slideWidth) / downsample));
                    }

                    if (tileY + downsample * tileHeight > slideHeight) {
                        adjustY = tileHeight - Math.floor(Math.abs((tileY - slideHeight) / downsample));
                    }

                    const height = tileHeight - adjustY;
                    const width = tileWidth - adjustX;

                    return result["openslide.remoteserver.uri"]
                        .replace("{tileX}", tileX)
                        .replace("{tileY}", tileY)
                        .replace("{level}", level)
                        .replace("{tileWidth}", width)
                        .replace("{tileHeight}", height);
                },
            });

            // This could also be openslide.mpp-x or openslide.mpp-y
            // TODO: Create fallback aperio.MPP does not exist
            const mpp = parseFloat(result["aperio.MPP"]);

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            viewer.scalebar({
                xOffset: 10,
                yOffset: 10,
                barThickness: 3,
                color: "#555555",
                fontColor: "#333333",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                pixelsPerMeter: mpp ? 1e6 / mpp : 0,
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const overlay = viewer.svgOverlay();

            window.d3.select(overlay.node()).selectAll("*").remove();

            Array.from(annotations).forEach((annotation) => {
                if (annotation.geometry.type === "LineString") {
                    drawLine(annotation.geometry.coordinates as LineString);
                } else if (annotation.geometry.type === "Polygon") {
                    drawPolygon(annotation.geometry.coordinates as Polygon);
                } else {
                    console.log(`${annotation.geometry.type} geometry type not implemented.`);
                }
            });

            function drawLine(coordinates: LineString) {
                window.d3
                    .select(overlay.node())
                    .append("line")
                    .style("stroke", "#f00")
                    .style("stroke-width", 0.001)
                    .attr("x1", scaleX(coordinates[0][0]))
                    .attr("y1", scaleY(coordinates[0][1]))
                    .attr("x2", scaleX(coordinates[1][0]))
                    .attr("y2", scaleY(coordinates[1][1]));
            }

            function drawPolygon(coordinates: Polygon) {
                window.d3
                    .select(overlay.node())
                    .append("polygon")
                    .style("stroke", "#f00")
                    .style("stroke-width", 0.001)
                    .style("fill", "transparent")
                    .attr("points", function () {
                        return coordinates[0]
                            .map(function (point: number[]) {
                                return [scaleX(point[0]), scaleY(point[1])].join(",");
                            })
                            .join(" ");
                    });
            }

            function scaleX(x: number) {
                return x / slideWidth;
            }

            function scaleY(y: number) {
                return y / slideHeight;
            }
        };

        try {
            apiHelper();
        } catch (e) {
            setViewer(null);
            if (e instanceof Error) {
                setError(e);
                toast.error(e.message);
            }
        }
    }, [slideId]);

    if (error) {
        return <p>Unexpected error with Viewer</p>;
    }

    return <div id="Viewer" className="h-full w-full" />;
}

export default Viewer;
