import { atom } from "recoil";
import { Host } from "types";

export const hostState = atom({
    key: "hostState",
    default: null as Host | null,
});
