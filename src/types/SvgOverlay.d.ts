declare namespace OpenSeadragon {
    declare class SvgOverlay {
        node(): GElement;
        resize(): void;
        onClick(node: unknown, handler: OpenSeadragon.MouseTracker): void;
    }
}
