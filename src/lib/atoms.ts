import OpenSeadragon from "openseadragon";
import { atom } from "recoil";
import { Annotation, Host } from "types";

export const hostState = atom({
    key: "hostState",
    default: null as Host | null,
});

export const selectedAnnotationState = atom({
    key: "selectedAnnotationState",
    default: null as Annotation | null,
});

export const viewportState = atom({
    key: "viewportState",
    default: null as OpenSeadragon.Viewport | null,
    dangerouslyAllowMutability: true,
});

export const overlayState = atom({
    key: "overlayState",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: null as any,
    dangerouslyAllowMutability: true,
});
