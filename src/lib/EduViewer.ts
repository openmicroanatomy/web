import { Annotation, LineString, MultiPolygon, Polygon } from "types";
import { sha1 } from "object-hash";
import * as d3 from "d3";
import OpenSeadragon, { ControlAnchor } from "openseadragon";
import { MeasuringPlugin, Tool } from "../openseadragon/openseadragon-measuring";
import { renderToStaticMarkup } from "react-dom/server";
import { ToolMeasureAreaIcon, ToolMeasureDistanceIcon } from "../components/icons/ToolIcons";
import SvgOverlay = OpenSeadragon.SvgOverlay;

export enum SlideRepository {
    NONE,
    OMERO,
    OpenMicroanatomy
}

export type SlideProperties = {
    repository: SlideRepository,

    /**
     * Count of pyramid levels. 0 = most zoomed in.
     */
    levelCount: number,

    /**
     * Downsamples for each level; length of array must equal <code>levelCount</code>.
     */
    downsamples: number[];

    /**
     * Slide height (maximum zoom) in pixels.
     */
    slideHeight: number,

    /**
     * Slide width (maximum zoom) in pixels.
     */
    slideWidth: number,

    /**
     * Tile height in pixels.
     */
    tileHeight: number,

    /**
     * Tile width in pixels.
     */
    tileWidth: number,

    /**
     * Supported placeholders: {level}, {tileX}, {tileY}, {tileHeight} and {tileWidth}
     */
    tileURL: string,

    millimetersPerPixel: number

    /**
     * @see http://openseadragon.github.io/docs/OpenSeadragon.TileSource.html#getTileUrl
     */
    getTileUrl: (level: number, x: number, y: number, properties: SlideProperties) => string;
}

export default class EduViewer {

    private Viewer: OpenSeadragon.Viewer;
    private Overlay: OpenSeadragon.SvgOverlay | undefined;
    private Tools: MeasuringPlugin | undefined;
    private SlideProperties!: SlideProperties;

    private readonly SetSelectedAnnotation: (annotation: Annotation | null) => void;

    constructor(callback: (annotation: Annotation | null) => void) {
        this.Viewer = OpenSeadragon({
            id: "Viewer",
            defaultZoomLevel: 0,
            //debugMode: import.meta.env.PROD,
            showNavigator: true,
            navigatorSizeRatio: 0.15,
            navigatorAutoFade: false,
            showNavigationControl: false,
            zoomPerScroll: 1.4,
            navigatorBorderColor: "#9ca3af", /* same as tailwind bg-gray-400 */
            gestureSettingsMouse: {
                clickToZoom: false,
                dblClickToZoom: true,
            }
        });

        this.SetSelectedAnnotation = callback;
    }

    OpenSlide(properties: SlideProperties) {
        this.SlideProperties = properties;

        this.Viewer.open({
            height: this.SlideProperties.slideHeight,
            width: this.SlideProperties.slideWidth,
            tileHeight: this.SlideProperties.tileHeight,
            tileWidth: this.SlideProperties.tileWidth,
            minLevel: 0,
            maxLevel: this.SlideProperties.levelCount - 1,
            tileOverlap: 0,
            getLevelScale: (level: number) => {
                return 1 / this.SlideProperties.downsamples[this.SlideProperties.levelCount - level - 1];
            },
            getTileUrl: (level: number, x: number, y: number) => {
                return this.SlideProperties.getTileUrl(level, x, y, this.SlideProperties)
            },
        });

        this.InitializeScalebar();
        this.InitializeOverlay();
        this.InitializeMeasuringTools();
    }

    private InitializeScalebar() {
        // @ts-ignore: cannot extend OpenSeadragon type definition
        this.Viewer.scalebar({
            xOffset: 10,
            yOffset: 10,
            barThickness: 3,
            color: "#555555",
            fontColor: "#333333",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            pixelsPerMeter: this.SlideProperties.millimetersPerPixel ? 1e6 / this.SlideProperties.millimetersPerPixel : 0,
        });
    }

    private InitializeOverlay() {
        // @ts-ignore: cannot extend OpenSeadragon type definition
        this.Overlay = this.Viewer.svgOverlay() as SvgOverlay;
    }

    private InitializeMeasuringTools() {
        // @ts-ignore: cannot extend OpenSeadragon type definition
        this.Tools = this.Viewer.Tools({
            viewer: this.Viewer,
            overlay: this.Overlay,
            enableControls: true,
            scaling: {
                x: this.SlideProperties.millimetersPerPixel,
                y: this.SlideProperties.millimetersPerPixel
            }
        })

        // @ts-ignore: incorrect type; allows also element id
        this.Viewer.removeControl("tool-controls");

        if (this.Tools === undefined) return;

        this.Viewer.addControl(
            MakeToolControlsElement(this.Tools),
            {
                anchor: ControlAnchor.TOP_LEFT,
                attachToViewer: true,
                autoFade: false
            }
        );
    }

    ClearAnnotations() {
        if (!this.Overlay) return;

        d3.select(this.Overlay.node())
            .selectAll("*")
            .remove();
    }

    ZoomAndPanToAnnotation(annotation: Annotation) {
        if (!this.Overlay) return;

        const SelectedAnnotationHash = sha1(annotation.geometry.coordinates);

        // Find the SVG element for the current Annotation and use its BoundingBox to zoom into. 
        const node = d3.select(this.Overlay.node())
            .selectAll(".annotation")
            .filter(function(data, index, nodes) {
                const CurrentAnnotationHash = (nodes[index] as Element).getAttribute("data-hash");

                return SelectedAnnotationHash == CurrentAnnotationHash;
            })
            .node() as SVGGraphicsElement;

        if (!node) return;

        const boundingbox = node.getBBox();

        // Expand bounding box by 1% so that the entire annotation is always visible
        const p1 = new OpenSeadragon.Point(boundingbox.x,                     boundingbox.y).times(0.99);
        const p2 = new OpenSeadragon.Point(boundingbox.x + boundingbox.width, boundingbox.y + boundingbox.height).times(1.01);

        const bounds = new OpenSeadragon.Rect(this.ScaleX(p1.x), this.ScaleY(p1.y), this.ScaleX(p2.x - p1.x), this.ScaleY(p2.y - p1.y));
        this.Viewer.viewport.fitBoundsWithConstraints(bounds);
    }

    HighlightAnnotation(annotation: Annotation) {
        if (!this.Overlay) return;

        const SelectedAnnotationHash = sha1(annotation.geometry.coordinates);

        // First remove any highlight by removing the `selected--annotation` class from every annotation
        d3.select(this.Overlay.node())
            .selectAll(".annotation")
            .classed("selected--annotation", false)

        // Now add the `selected--annotation` class to our selected annotation
        d3.select(this.Overlay.node())
            .selectAll(".annotation")
            .filter(function(data, index, nodes) {
                const CurrentAnnotationHash = (nodes[index] as Element).getAttribute("data-hash");

                return SelectedAnnotationHash == CurrentAnnotationHash;
            })
            .classed("selected--annotation", true);
    }

    DrawAnnotations(annotations: Annotation[]) {
        if (!this.Overlay) return;

        for (const annotation of annotations) {
            if (annotation.geometry.type === "LineString") {
                this.DrawLine(annotation);
            } else if (annotation.geometry.type === "Polygon") {
                this.DrawPolygon(annotation);
            } else if (annotation.geometry.type === "MultiPolygon") {
                this.DrawMultiPolygon(annotation);
            } else {
                console.log(`${annotation.geometry.type} geometry type not implemented.`);
            }
        }
    }

    PanTo(x: number, y: number) {
        this.Viewer.viewport.panTo(new OpenSeadragon.Point(this.ScaleX(x), this.ScaleY(y)), false);
    }

    ZoomTo(zoom: number) {
        this.Viewer.viewport.zoomTo(zoom)
    }

    /**
     * Set the viewer rotation in radians.
     * @param radians the rotation in radians.
     */
    SetRotation(radians: number) {
        this.Viewer.viewport.setRotation(radians * (180 / Math.PI));
    }

    private DrawLine(annotation: Annotation) {
        if (!this.Overlay) return;

        const coordinates = annotation.geometry.coordinates as LineString;

        d3.select(this.Overlay.node())
            .append("line")
            .attr("data-hash", sha1(coordinates))
            .attr("class", "annotation")
            .attr("x1", coordinates[0][0])
            .attr("y1", coordinates[0][1])
            .attr("x2", coordinates[1][0])
            .attr("y2", coordinates[1][1])
            .on("dblclick", () => { this?.SetSelectedAnnotation(annotation) });
    }

    private DrawPolygon(annotation: Annotation) {
        if (!this.Overlay) return;

        const coordinates = annotation.geometry.coordinates as Polygon;

        const points = coordinates[0].map((point: number[]) => {
            return [point[0], point[1]].join(",");
        }).join(" ");
        
        d3.select(this.Overlay.node())
            .append("polygon")
            .attr("data-hash", sha1(coordinates))
            .attr("class", "annotation")
            .attr("points", points)
            .on("dblclick", () => { this?.SetSelectedAnnotation(annotation) });
    }

    /**
     * A MultiPolygon contains multiple Polygons inside its coordinates array.
     */
    private DrawMultiPolygon(annotation: Annotation) {
        if (!this.Overlay) return;

        const coordinates = annotation.geometry.coordinates as MultiPolygon;
        
        const points = coordinates.map(polygon => {
            return polygon[0].map((point: number[]) => {
                return [point[0], point[1]].join(",");
            }).join(" ");
        }).join(" ");

        d3.select(this.Overlay.node())
            .append("polygon")
            .attr("data-hash", sha1(coordinates))
            .attr("class", "annotation")
            .attr("points", points)
            .on("dblclick", () => { this?.SetSelectedAnnotation(annotation) });
    }

    private ScaleX(x: number) {
        return x / this.SlideProperties.slideWidth;
    }

    private ScaleY(y: number) {
        // For some reason we need to multiply the y-coordinate by the ratio of the height and width.
        // This is not necessary for the x-coordinate for some reason.
        // This requires some further investigation into why this happens.
        return (y / this.SlideProperties.slideHeight) * (this.SlideProperties.slideHeight / this.SlideProperties.slideWidth);
    }
}

function MakeToolControlsElement(tools: MeasuringPlugin) {
    const buttons = document.createElement("div");
    const buttonStyles = ["p-2", "cursor-pointer", "bg-blue-500", "hover:bg-blue-600"]

    buttons.id = "tool-controls";
    buttons.classList.add("!flex", "flex-col", "m-2");

    const distance = document.createElement("button");
    const area     = document.createElement("button");

    distance.classList.add(...buttonStyles);
    distance.innerHTML = renderToStaticMarkup(ToolMeasureDistanceIcon());
    distance.onclick = () => {
        if (tools.getTool() === Tool.Distance) {
            area.classList.toggle("bg-blue-600", false);
            distance.classList.toggle("bg-blue-600", false);
            tools.setTool(Tool.None);
        } else {
            area.classList.toggle("bg-blue-600", false);
            distance.classList.toggle("bg-blue-600", true);
            tools.setTool(Tool.Distance);
        }
    }

    area.classList.add(...buttonStyles);
    area.innerHTML = renderToStaticMarkup(ToolMeasureAreaIcon());
    area.onclick = () => {
        if (tools.getTool() === Tool.Area) {
            area.classList.toggle("bg-blue-600", false);
            distance.classList.toggle("bg-blue-600", false);
            tools.setTool(Tool.None);
        } else {
            area.classList.toggle("bg-blue-600", true);
            distance.classList.toggle("bg-blue-600", false);
            tools.setTool(Tool.Area);
        }
    }

    buttons.append(distance, area);

    return buttons;
}