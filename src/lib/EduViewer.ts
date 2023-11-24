import { Annotation, LineString, MultiPolygon, Polygon } from "types";
import { sha1 } from "object-hash";
import { SetterOrUpdater } from "recoil";
import * as d3 from "d3";
import OpenSeadragon from "openseadragon";

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
    serverUri: string,

    millimetersPerPixel: number
}

export default class EduViewer {

    private Viewer: OpenSeadragon.Viewer;
    private Overlay: OpenSeadragon.SvgOverlay | undefined;
    private SlideProperties!: SlideProperties;

    private SetSelectedAnnotation: SetterOrUpdater<Annotation | null>;

    constructor(viewer: OpenSeadragon.Viewer, updater: SetterOrUpdater<Annotation | null>) {
        this.Viewer = viewer;
        this.SetSelectedAnnotation = updater;
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
                level = this.SlideProperties.levelCount - level - 1;

                if (this.SlideProperties.repository === SlideRepository.OMERO) {
                    return this.SlideProperties.serverUri
                        .replaceAll("{tileX}", String(x))
                        .replaceAll("{tileY}", String(y))
                        .replaceAll("{level}", String(level))
                        .replaceAll("{tileWidth}", String(this.SlideProperties.tileWidth))
                        .replaceAll("{tileHeight}", String(this.SlideProperties.tileHeight));
                }

                const downsample = this.SlideProperties.downsamples[level];

                let adjustY = 0;
                let adjustX = 0;

                const tileY = y * this.SlideProperties.tileHeight * downsample;
                const tileX = x * this.SlideProperties.tileWidth  * downsample;

                if (tileX + downsample * this.SlideProperties.tileWidth > this.SlideProperties.slideWidth) {
                    adjustX = this.SlideProperties.tileWidth  - Math.floor(Math.abs((tileX - this.SlideProperties.slideWidth) / downsample));
                }

                if (tileY + downsample * this.SlideProperties.tileHeight > this.SlideProperties.slideHeight) {
                    adjustY = this.SlideProperties.tileHeight - Math.floor(Math.abs((tileY - this.SlideProperties.slideHeight) / downsample));
                }

                const height = this.SlideProperties.tileHeight - adjustY;
                const width  = this.SlideProperties.tileWidth  - adjustX;

                return this.SlideProperties.serverUri
                    .replaceAll("{tileX}", String(tileX))
                    .replaceAll("{tileY}", String(tileY))
                    .replaceAll("{level}", String(level))
                    .replaceAll("{tileWidth}", String(width))
                    .replaceAll("{tileHeight}", String(height));
            },
        });

        this.InitializeScalebar();
        this.InitializeOverlay();
    }

    private InitializeScalebar() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.Overlay = this.Viewer.svgOverlay() as SvgOverlay;
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

        Array.from(annotations).forEach((annotation) => {
            if (annotation.geometry.type === "LineString") {
                this.DrawLine(annotation);
            } else if (annotation.geometry.type === "Polygon") {
                this.DrawPolygon(annotation);
            } else if (annotation.geometry.type === "MultiPolygon") {
                this.DrawMultiPolygon(annotation);
            } else {
                console.log(`${annotation.geometry.type} geometry type not implemented.`);
            }
        });
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
