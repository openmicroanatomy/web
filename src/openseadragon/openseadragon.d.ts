import { MeasuringPlugin, ToolPluginOptions } from "./openseadragon-measuring";
import { SlideTourPlugin, SlideTourPluginOptions } from "./openseadragon-slide-tours";

declare module "OpenSeadragon" {
    interface Viewer {
        svgOverlay: () => SvgOverlay;
        scalebar: (options: unknown) => void;

        Tools: (options: ToolPluginOptions) => MeasuringPlugin;
        toolsInstance: MeasuringPlugin;

        SlideTours: (options: SlideTourPluginOptions) => SlideTourPlugin;
        slideToursInstance: SlideTourPlugin;

        /**
         * Internally uses {@link OpenSeadragon.getElement} which supports `string | Element`
         */
        removeControl: (control: Control | string) => Control;
    }

    interface SvgOverlay {
        node: () => SVGElement;
        open: () => void;
        resize: () => void;
        onClick: (node: string | element, handler: EventHandler<MouseTrackerEvent>) => void;
    }
}
