import { atom } from "recoil";
import { Annotation, EduHost, Slide, SlideTourState } from "types";

export const hostState = atom({
    key: "hostState",
    default: null as EduHost | null,
});

export const selectedAnnotationState = atom({
    key: "selectedAnnotationState",
    default: null as Annotation | null,
});

export const currentSlideState = atom({
    key: "currentSlide",
    default: null as Slide | null
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
