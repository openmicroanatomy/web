import OpenSeadragon, { Placement, Point } from "openseadragon";
import SvgOverlay = OpenSeadragon.SvgOverlay;

/**
 * Scaling factor used for measurement; pixels/mm.
 */
export type MeasurementScaling = {
	x: number;
	y: number;
}

export type ToolPluginOptions = {
	viewer: OpenSeadragon.Viewer;
	overlay: SvgOverlay;
	scaling: MeasurementScaling;
}

(function() {
	const $ = OpenSeadragon;

	if (!$.version || $.version.major < 3) {
		throw new Error("Requires OpenSeadragon 3.0.0+");
	}

	// @ts-ignore
	$.Viewer.prototype.Tools = function(options: ToolPluginOptions) {
		options = options || {};
		options.viewer = this;

		return new MeasuringPlugin(options);
	}
})();

export enum Tool {
	None,
	Distance,
	Area
}

export class MeasuringPlugin {

	private tool: Tool = Tool.None;
	private scaling: MeasurementScaling = { x: 1, y: 1 };
	private viewer: OpenSeadragon.Viewer;

	private overlay: SvgOverlay;
	private readonly MEASUREMENT_OVERLAY_ID: string;

	constructor(options: ToolPluginOptions) {
		console.log("Registering Tools plugin...");

		if (!options.viewer) {
			throw new Error("A viewer must be specified.");
		}

		this.viewer = options.viewer;
		this.scaling = options.scaling;
		this.overlay = options.overlay;

		// Each instance requires a unique ID for measurements due to how OpenSeadragon internally handles methods such
		// as removeOverlay(); -- without this overlays would not be removed if using multiple viewers simultaneously.
		this.MEASUREMENT_OVERLAY_ID = `MEASUREMENT-${this.viewer.element.id}`;

		this.Ruler();
		this.Area();
	}

	Ruler() {
		let measuring = false;
		let StartPoint: OpenSeadragon.Point | null;
		let EndPoint: OpenSeadragon.Point | null;

		const tracker = new OpenSeadragon.MouseTracker({
			element: this.viewer.container,
			startDisabled: true,
			moveHandler: (e) => {
				if (this.tool != Tool.Distance) {
					tracker.setTracking(false);
					return;
				}

				if (!measuring || !StartPoint) return;

				// @ts-ignore
				EndPoint = e.position;

				const distance = this.getLineDistance(StartPoint!, EndPoint!);
				const middlePoint = this.getLineMiddlePoint(StartPoint!, EndPoint!);

				if (distance > 1000) {
					this.updateMeasurementTag(`${(distance / 1000).toFixed(2)} mm`, middlePoint);
				} else {
					this.updateMeasurementTag(`${distance.toFixed(2)} µm`, middlePoint);
				}

				this.updateMeasurementROI(this.createLineSVG(StartPoint!, EndPoint!));
			},
		});

		this.viewer.addHandler("canvas-click", e => {
			if (this.tool != Tool.Distance) return;
			if (!e.quick) return;

			if (measuring) {
				EndPoint = e.position;
			} else {
				StartPoint = e.position;

				if (EndPoint) {
					this.clearMeasurementROI();
					this.clearMeasurementTag();
					EndPoint = null;
				}
			}

			measuring = !measuring;
			tracker.setTracking(measuring);
		});
	}

	Area() {
		let points: OpenSeadragon.Point[] = [];

		this.viewer.addHandler("canvas-drag", e => {
			if (this.tool != Tool.Area) return;

			e.preventDefaultAction = true;

			this.clearMeasurementTag();

			points.push(e.position);

			this.updateMeasurementROI(this.createPolygonSVG(points));
		})

		this.viewer.addHandler("canvas-drag-end", () => {
			if (this.tool != Tool.Area) return;
			if (points.length < 3) return;

			const area = this.getPolygonArea(points);
			const centroid = this.getPolygonCentroid(points);

			if (area > 1_000_000) {
				this.updateMeasurementTag(`${(area / 1_000_000).toFixed(2)} mm²`, centroid);
			} else {
				this.updateMeasurementTag(`${area.toFixed(2)} µm²`, centroid);
			}

			this.updateMeasurementROI(this.createPolygonSVG(points));

			points = [];
		})
	}

	getTool() {
		return this.tool;
	}

	setTool(tool: Tool) {
		this.clearMeasurementTag();
		this.clearMeasurementROI();

		this.tool = tool;
	}

	setScaling(scaling: MeasurementScaling) {
		this.scaling = scaling;
	}

	updateMeasurementTag(tag: string, centre: OpenSeadragon.Point) {
		this.clearMeasurementTag();

		const measurement = document.createElement("div");
		measurement.id = this.MEASUREMENT_OVERLAY_ID;
		measurement.className = "measurement-tag";
		measurement.innerText = tag;

		this.viewer.addOverlay(measurement, centre, Placement.CENTER);
	}

	clearMeasurementTag() {
		this.viewer.removeOverlay(this.MEASUREMENT_OVERLAY_ID)
	}

	updateMeasurementROI(svg: Node) {
		// @ts-ignore
		this.overlay.open(); // todo: fix this; currently not triggering open(); event so this is never run
		const elements = Array.from(this.overlay.node().children);

		this.overlay.node().replaceChildren(
			...elements.filter(element => !(element.classList.contains("measurement"))),
			svg
		)
	}
	clearMeasurementROI() {
		const elements = Array.from(this.overlay.node().children);

		this.overlay.node().replaceChildren(
			...elements.filter(element => !(element.classList.contains("measurement")))
		)
	}

	createLineSVG(p1: OpenSeadragon.Point, p2: OpenSeadragon.Point): Node {
		const line = document.createElementNS('http://www.w3.org/2000/svg','line');

		p1 = this.viewer.viewport.viewerElementToImageCoordinates(p1);
		p2 = this.viewer.viewport.viewerElementToImageCoordinates(p2);

		line.setAttribute("x1", p1.x.toFixed(2));
		line.setAttribute("y1", p1.y.toFixed(2));
		line.setAttribute("x2", p2.x.toFixed(2));
		line.setAttribute("y2", p2.y.toFixed(2));
		line.setAttribute("class", "measurement measurement--line");

		return line;
	}

	createPolygonSVG(coords: OpenSeadragon.Point[]) {
		coords = coords.map(point => this.viewer.viewport.viewerElementToImageCoordinates(point));

		const points = coords.map(point => {
			return `${point.x.toFixed(2)}, ${point.y.toFixed(2)}`
		}).join(" ");

		const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

		polygon.setAttribute("points", points)
		polygon.setAttribute("class", "measurement measurement--area");

		return polygon;
	}

	/**
	 * Get the centroid of a polygon.
	 * @todo does not support self-intersecting polygons.
	 * @see https://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-polygon-in-javascript
	 * @param coords points of polygon; automatically completes polygon if needed.
	 */
	getPolygonCentroid(coords: OpenSeadragon.Point[]) {
		coords = this.completePolygon(coords);
		coords = coords.map(point => this.viewer.viewport.viewerElementToViewportCoordinates(point))

		let totalArea = 0, x = 0, y = 0;

		for (let i = 0; i < coords.length; i++) {
			const p1 = coords[i];
			const p2 = coords[(i + 1) % coords.length];
			const area = p1.x * p2.y - p2.x * p1.y;

			x += (p1.x + p2.x) * area;
			y += (p1.y + p2.y) * area;
			totalArea += area;
		}

		const factor = totalArea * 3;

		return new OpenSeadragon.Point(x / factor, y / factor);
	}

	/**
	 * Calculate the area of an arbitrary polygon.
	 * @todo does not support self-intersecting polygons.
	 * @see https://stackoverflow.com/questions/62323834/calculate-polygon-area-javascript
	 * @param coords points of polygon; automatically completes polygon if needed.
	 */
	getPolygonArea(coords: OpenSeadragon.Point[]) {
		coords = this.completePolygon(coords);
		coords = coords.map(point => this.viewer.viewport.viewerElementToImageCoordinates(point))

		let area = 0;

		for (let i = 0; i < coords.length; i++) {
			const p1 = coords[i];
			const p2 = coords[(i + 1) % coords.length];

			area += (p1.x * this.scaling.x) * (p2.y * this.scaling.y) - (p2.x * this.scaling.x) * (p1.y * this.scaling.y);
		}

		return Math.abs(area) / 2;
	}

	getLineMiddlePoint(p1: OpenSeadragon.Point, p2: OpenSeadragon.Point): OpenSeadragon.Point {
		p1 = this.viewer.viewport.viewerElementToViewportCoordinates(p1);
		p2 = this.viewer.viewport.viewerElementToViewportCoordinates(p2);

		return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
	}

	getLineDistance(p1: OpenSeadragon.Point, p2: OpenSeadragon.Point) {
		p1 = this.viewer.viewport.viewerElementToImageCoordinates(p1);
		p2 = this.viewer.viewport.viewerElementToImageCoordinates(p2);

		const x = (p2.x - p1.x) * this.scaling.x;
		const y = (p2.y - p1.y) * this.scaling.y;

		return Math.hypot(x, y);
	}

	/**
	 * Checks that given polygon is complete i.e. first and last point is the same.
	 * If not, completes the polygon by copying the first point as the last point.
	 * @param coords array of points which form a complete polygon
	 */
	completePolygon(coords: OpenSeadragon.Point[]): OpenSeadragon.Point[] {
		const first = coords[0];
		const last = coords[coords.length - 1];

		// Polygon must be complete i.e. first and last point is the same
		if (first.x != last.x || first.y != last.y) {
			coords.push(first);
		}

		return coords;
	}
}