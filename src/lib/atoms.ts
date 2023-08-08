import OpenSeadragon from "openseadragon";
import { atom } from "recoil";
import { Annotation, Host, Image, SlideTourState } from "types";

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

export const currentSlideState = atom({
    key: "currentSlide",
    default: null as Image | null
})

export const sidebarVisibleState = atom({
    key: "sidebarVisibleState",
    default: true as boolean
});

export const slideTourState = atom({
    key: "slideTourState",
    default: { active: false, index: 0, entries: [] } as SlideTourState
})

export const displaySlideNumbersState = atom({
    key: "displaySlideNumbersState",
    default: false
})
