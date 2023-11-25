declare namespace OpenSeadragon {
    declare class SvgOverlay {
        node(): SVGElement;
        resize(): void;
        onClick(node: unknown, handler: OpenSeadragon.MouseTracker): void;
    }
}
