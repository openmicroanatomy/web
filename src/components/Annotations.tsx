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

    return (
        <div id="Annotations" className="pt-2">
            {annotations && annotations.length > 0 ? (
                <>
                    {annotations.map((annotation, index) => (
                        <div
                            className="grid grid-cols-4 p-2 border-b border-t mb-2 cursor-pointer"
                            key={sha1(annotation)}
                        >
                            <div className={`col-span-4 ${selectedAnnotation == annotation && "font-bold"}`} onClick={() => setSelectedAnnotation(annotation)}>
                                {`${index + 1}. ${annotation.properties.name || "Unnamed annotation"}`}
                            </div>
                        </div>
                    ))}

                    <div className="sticky bottom-0 border-b text-center bg-blue-500 text-white font-bold text-xl">
                        {selectedAnnotation ? (
                            <AnnotationPopup annotation={selectedAnnotation} />
                        ) : (
                            <p className="py-2">No annotation selected</p>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-center font-bold">No annotations</p>
            )}
        </div>
    );
}

export default Annotations;
