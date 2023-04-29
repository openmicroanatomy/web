// OpenSeadragon SVG Overlay plugin 0.0.7
import OpenSeadragon from "openseadragon";

(function () {
    var $ = OpenSeadragon;

    var svgNS = "http://www.w3.org/2000/svg";

    // ----------
    $.Viewer.prototype.svgOverlay = function () {
        if (this._svgOverlayInfo) {
            return this._svgOverlayInfo;
        }

        this._svgOverlayInfo = new Overlay(this);
        return this._svgOverlayInfo;
    };

    // ----------
    var Overlay = function (viewer) {
        var self = this;

        this._viewer = viewer;

        this._svg = document.createElementNS(svgNS, "svg");
        this._svg.style.position = "absolute";
        this._svg.style.left = 0;
        this._svg.style.top = 0;
        this._svg.style.width = "100%";
        this._svg.style.height = "100%";
        this._svg.style.transformOrigin = "0 0";

        if (this._viewer.debugMode) {
            this._svg.style.background = "rgba(0,255,0,0.25)";
        }

        this._viewer.canvas.appendChild(this._svg);

        this._viewer.addHandler("animation", function () {
            self.resize();
        });

        this._viewer.addHandler("open", function () {
            self.open();
            self.resize();
        });

        this._viewer.addHandler("rotate", function (evt) {
            self.resize();
        });

        this._viewer.addHandler("resize", function () {
            self.resize();
        });
    };

    // ----------
    Overlay.prototype = {
        // ----------
        node: function () {
            return this._svg;
        },

        // ----------
        open: function () {
            this._svg.setAttribute(
                "viewBox",
                `0 0 ${this._viewer.world._contentSize.x} ${this._viewer.world._contentSize.y}`
            );
        },

        // ----------
        resize: function () {
            // Used to calculate the actual viewport offset from the container it is inside i.e. the black area between the container and the viewer
            const point = this._viewer.viewport.pixelFromPoint(new $.Point(0, 0), true);

            // Used to calculate the actual viewport size; requires 3 points to support rotated images.
            const p1 = this._viewer.viewport.imageToViewerElementCoordinates(new $.Point(0, 0));
            const p2 = this._viewer.viewport.imageToViewerElementCoordinates(
                new $.Point(this._viewer.world._contentSize.x, this._viewer.world._contentSize.y)
            );
            const p3 = this._viewer.viewport.imageToViewerElementCoordinates(
                new $.Point(this._viewer.world._contentSize.x, 0)
            );

            const width = Math.hypot(p3.x - p1.x, p3.y - p1.y);
            const height = Math.hypot(p2.x - p3.x, p2.y - p3.y);

            const rotation = this._viewer.viewport.getRotation();

            this._svg.style.width = `${width}px`;
            this._svg.style.height = `${height}px`;
            this._svg.style.transform = `translateX(${point.x}px) translateY(${point.y}px) rotate(${rotation}deg)`;
        },
        // ----------
        onClick: function (node, handler) {
            // TODO: Fast click for mobile browsers

            new $.MouseTracker({
                element: node,
                clickHandler: handler,
            }).setTracking(true);
        },
    };
})();
