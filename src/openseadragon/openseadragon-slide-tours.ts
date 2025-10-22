import OpenSeadragon, { ControlAnchor } from "openseadragon";
import { SlideTourState } from "../types";
import { renderToString } from "react-dom/server";
import SlideTour from "../components/SlideTour";
import { hydrateRoot } from "react-dom/client";

export type SlideTourPluginOptions = {
    viewer: OpenSeadragon.Viewer;
    slideTour: SlideTourState | null;
}

(function() {
    const $ = OpenSeadragon;

    if (!$.version || $.version.major < 3) {
        throw new Error("Requires OpenSeadragon 3.0.0+");
    }

    $.Viewer.prototype.SlideTours = function(options: SlideTourPluginOptions) {
        let instance = options.viewer.slideToursInstance;

        if (!instance) {
            options = options || {};
            options.viewer = this;

            instance = new SlideTourPlugin(options);

            options.viewer.slideToursInstance = instance;
        }

        return instance;
    }
})();

export class SlideTourPlugin {

    private viewer: OpenSeadragon.Viewer;

    constructor(options: SlideTourPluginOptions) {
        console.log("Registering Slide Tours plugin ...");

        this.viewer = options.viewer;
    }

    UpdateSlideTourUI() {
        this.viewer.removeControl("slide-tour-container");

        this.viewer.addControl(
            this.MakeSlideTourElement(),
            {
                anchor: ControlAnchor.TOP_LEFT,
                attachToViewer: true,
                autoFade: false
            }
        );
    }

    private MakeSlideTourElement() {
        const container = document.createElement("div");
        container.id = "slide-tour-container";
        container.innerHTML = renderToString(SlideTour({}));

        hydrateRoot(container, SlideTour({}));

        return container;
    }
}
