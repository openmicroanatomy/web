import { Annotation, LineString, MultiPolygon, Polygon } from "types";
import { sha1 } from "object-hash";
import { SetterOrUpdater } from "recoil";
import * as d3 from "d3";
import OpenSeadragon from "openseadragon";

export default class EduViewer {

    private Viewer: OpenSeadragon.Viewer;
    private Overlay: OpenSeadragon.SvgOverlay | undefined;

    private Downsamples!: number[];
    private LevelCount!: number;

    private SlideHeight!: number;
    private SlideWidth!: number;

    private TileHeight!: number;
    private TileWidth!: number;
    
    private ServerUri!: string;
    private MillimetersPerPixel!: number;

    private SetSelectedAnnotation: SetterOrUpdater<Annotation | null>;

    constructor(viewer: OpenSeadragon.Viewer, updater: SetterOrUpdater<Annotation | null>) {
        this.Viewer = viewer;
        this.SetSelectedAnnotation = updater;
    }

    LoadSlide(data: Record<string, string>) {
        this.LevelCount = parseInt(data["openslide.level-count"]);

        this.Downsamples = [];
        for (let i = 0; i < this.LevelCount; i++) {
            const downsample = parseInt(data["openslide.level[" + i + "].downsample"]);
            this.Downsamples.push(Math.floor(downsample));
        }

        this.SlideHeight = parseInt(data["openslide.level[0].height"]);
        this.SlideWidth  = parseInt(data["openslide.level[0].width"]);
        this.TileHeight  = parseInt(data["openslide.level[0].tile-width"]);
        this.TileWidth   = parseInt(data["openslide.level[0].tile-height"]);
        this.ServerUri   = data["openslide.remoteserver.uri"];

        // TODO: Create fallback if doesn't exist (alternatively openslide.mpp-x or openslide.mpp-y)
        this.MillimetersPerPixel = parseFloat(data["aperio.MPP"])

        this.InitializeViewer();
        this.InitializeScalebar();
        this.InitializeOverlay();
    }

    InitializeViewer() {
        this.Viewer.open({
            height: this.SlideHeight,
            width: this.SlideWidth,
            tileHeight: this.TileHeight,
            tileWidth: this.TileWidth,
            minLevel: 0,
            maxLevel: this.LevelCount - 1,
            tileOverlap: 0,
            getLevelScale: (level: number) => {
                return 1 / this.Downsamples[this.LevelCount - level - 1];
            },
            getTileUrl: (level: number, x: number, y: number) => {
                level = this.LevelCount - level - 1;

                const downsample = this.Downsamples[level];

                let adjustY = 0;
                let adjustX = 0;

                const tileY = y * this.TileHeight * downsample;
                const tileX = x * this.TileWidth  * downsample;

                if (tileX + downsample * this.TileWidth > this.SlideWidth) {
                    adjustX = this.TileWidth  - Math.floor(Math.abs((tileX - this.SlideWidth) / downsample));
                }

                if (tileY + downsample * this.TileHeight > this.SlideHeight) {
                    adjustY = this.TileHeight - Math.floor(Math.abs((tileY - this.SlideHeight) / downsample));
                }

                const height = this.TileHeight - adjustY;
                const width  = this.TileWidth  - adjustX;

                return this.ServerUri
                           .replaceAll("{tileX}", String(tileX))
                           .replaceAll("{tileY}", String(tileY))
                           .replaceAll("{level}", String(level))
                           .replaceAll("{tileWidth}", String(width))
                           .replaceAll("{tileHeight}", String(height));
            },
        });
    }

    InitializeScalebar() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.Viewer.scalebar({
            xOffset: 10,
            yOffset: 10,
            barThickness: 3,
            color: "#555555",
            fontColor: "#333333",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            pixelsPerMeter: this.MillimetersPerPixel ? 1e6 / this.MillimetersPerPixel : 0,
        });
    }

    InitializeOverlay() {
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
        return x / this.SlideWidth;
    }

    private ScaleY(y: number) {
        // For some reason we need to multiply the y-coordinate by the ratio of the height and width.
        // This is not necessary for the x-coordinate for some reason.
        // This requires some further investigation into why this happens.
        return (y / this.SlideHeight) * (this.SlideHeight / this.SlideWidth);
    }
}
