import { SvgOverlay } from "openseadragon";
import { Annotation, LineString, Polygon } from "types";
import { sha1 } from "object-hash";
import { centroid } from "./helpers";
import { SetterOrUpdater } from "recoil";

export default class EduViewer {

    private Viewer: OpenSeadragon.Viewer;
    private Overlay!: OpenSeadragon.SvgOverlay;

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

        this.RegisterOnZoomListener();
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
                           .replace("{tileX}", String(tileX))
                           .replace("{tileY}", String(tileY))
                           .replace("{level}", String(level))
                           .replace("{tileWidth}", String(width))
                           .replace("{tileHeight}", String(height));
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

    RegisterOnZoomListener() {
        // 0.001 is the default size for stroke thickness as defined in Viewer.css
        const ScalingFactor = 0.001 / this.Viewer.viewport.getMinZoom();

        this.Viewer.addHandler('zoom', function (viewer) {
            // Thickness = ScalingFactor * Inverse Zoom
            const thickness = ScalingFactor * (1 / (viewer.zoom ?? 1));
            document.documentElement.style.setProperty(`--stroke-thickness`, String(thickness));
        });
    }
    
    ClearAnnotations() {
        window.d3
            .select(this.Overlay.node())
            .selectAll("*")
            .remove();
    }

    PanToAnnotation(annotation: Annotation) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const screenWidth = (this.Viewer.viewport as any)._contentSize.x;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const screenHeight = (this.Viewer.viewport as any)._contentSize.y;

        const centre = centroid(annotation.geometry, screenWidth, screenHeight);
        this.Viewer.viewport.panTo(centre);
    }
    
    ZoomToAnnotation(annotation: Annotation) {
        const SelectedAnnotationHash = sha1(annotation.geometry.coordinates);

        // Find the SVG element for the current Annotation and use its BoundingBox to zoom into. 
        const node = window.d3
            .select(this.Overlay.node())
            .selectAll(".annotation")
            .filter(function(data, index, nodes) {
                const CurrentAnnotationHash = (nodes[index] as Element).getAttribute("data-hash");

                return SelectedAnnotationHash == CurrentAnnotationHash;
            })
            .node() as SVGGraphicsElement;

        if (!node) return;

        const boundingbox = node.getBBox();

        // TODO: Make the bounds slightly larger, so that the whole annotation is visible when focusing
        const bounds = new OpenSeadragon.Rect(boundingbox.x, boundingbox.y, boundingbox.width, boundingbox.height);
        this.Viewer.viewport.fitBoundsWithConstraints(bounds);
    }

    HighlightAnnotation(annotation: Annotation) {
        const SelectedAnnotationHash = sha1(annotation.geometry.coordinates);

        // First remove any highlight by removing the `selected--annotation` class from every annotation
        window.d3
            .select(this.Overlay.node())
            .selectAll(".annotation")
            .classed("selected--annotation", false)

        // Now add the `selected--annotation` class to our selected annotation
        window.d3
            .select(this.Overlay.node())
            .selectAll(".annotation")
            .filter(function(data, index, nodes) {
                const CurrentAnnotationHash = (nodes[index] as Element).getAttribute("data-hash");

                return SelectedAnnotationHash == CurrentAnnotationHash;
            })
            .classed("selected--annotation", true);
    }

    DrawAnnotations(annotations: Annotation[]) {
        Array.from(annotations).forEach((annotation) => {
            if (annotation.geometry.type === "LineString") {
                this.DrawLine(annotation);
            } else if (annotation.geometry.type === "Polygon") {
                this.DrawPolygon(annotation);
            } else {
                console.log(`${annotation.geometry.type} geometry type not implemented.`);
            }
        });
    }

    private DrawLine(annotation: Annotation) {
        const coordinates = annotation.geometry.coordinates as LineString;

        window.d3
            .select(this.Overlay.node())
            .append("line")
            .attr("data-hash", sha1(coordinates))
            .attr("class", "annotation")
            .style("stroke", "#f00")
            .attr("x1", this.ScaleX(coordinates[0][0]))
            .attr("y1", this.ScaleY(coordinates[0][1]))
            .attr("x2", this.ScaleX(coordinates[1][0]))
            .attr("y2", this.ScaleY(coordinates[1][1]))
            .on("click", () => { this?.SetSelectedAnnotation(annotation) });
    }

    private DrawPolygon(annotation: Annotation) {
        const coordinates = annotation.geometry.coordinates as Polygon;
                
        window.d3
            .select(this.Overlay.node())
            .append("polygon")
            .attr("data-hash", sha1(coordinates))
            .attr("class", "annotation")
            .style("stroke", "#f00")
            .style("fill", "transparent")
            .attr("points", () => {
                return coordinates[0]
                    .map((point: number[]) => {
                        return [this.ScaleX(point[0]), this.ScaleY(point[1])].join(",");
                    })
                    .join(" ");
            })
            .on("click", () => { this?.SetSelectedAnnotation(annotation) });
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
