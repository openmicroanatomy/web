import { useRecoilValue } from "recoil";
import { selectedAnnotationState } from "../lib/atoms";
import AnnotationPopup from "./AnnotationPopup";

export function AnnotationDetail() {
    const selectedAnnotation = useRecoilValue(selectedAnnotationState);

    if (!selectedAnnotation) {
        return (
            <div className="p-2 bg-gray-500 rounded-b-sm text-white font-bold text-center">
                <p>No annotation selected</p>
            </div>
        )
    }

    return (
        <div className="flex p-2 bg-blue-500 rounded-b-sm text-white font-bold text-sm align-middle">
            <div className="flex-grow text-left break-words">
                {selectedAnnotation.properties.name}
            </div>

            <div className="flex-grow text-right underline whitespace-nowrap self-center">
                <AnnotationPopup annotation={selectedAnnotation} />
            </div>
        </div>
    )
}
