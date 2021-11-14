import OpenSeadragon from "openseadragon";
import { atom } from "recoil";
import { Host } from "types";

export const hostState = atom({
    key: "hostState",
    default: null as Host | null,
});

export const viewerState = atom({
    key: "viewerState",
    default: null as OpenSeadragon.Viewport | null,
    dangerouslyAllowMutability: true
})
