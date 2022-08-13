import { selectedAnnotationState } from "lib/atoms";
import { useRecoilState } from "recoil";
import { Annotation } from "types";
import AnnotationPopup from "./AnnotationPopup";
import { sha1 } from "object-hash";

interface AnnotationsProps {
    annotations?: Annotation[];
}

function Annotations({ annotations }: AnnotationsProps) {
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);

    if (!annotations || annotations.length == 0) {
        return <p className="p-2 font-bold text-center">No annotations</p>;
    }

    return (
        <div className="pt-2">
            {annotations.map((annotation, index) => (
                <div
                    className="grid grid-cols-4 p-2 border-b border-t mb-2 cursor-pointer"
                    key={sha1(annotation)}
                    onClick={() => setSelectedAnnotation(annotation)}
                >
                    <div
                        className={`cursor-pointer col-span-4 ${selectedAnnotation == annotation && "font-bold"}`}
                    >
                        {`${index + 1}. ${annotation.properties.name || "Unnamed annotation"}`}
                    </div>
                </div>
            ))}

            <div className="hidden lg:block sticky bottom-0 border-b py-2 text-center bg-blue-500 text-white font-bold text-xl">
                {selectedAnnotation ? (
                    <AnnotationPopup annotation={selectedAnnotation} />
                ) : (
                    <p>No annotation selected</p>
                )}
            </div>
        </div>
    );
}

export default Annotations;
