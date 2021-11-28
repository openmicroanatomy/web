import "reactjs-popup/dist/index.css";
import { Annotation } from "types";
import { useEffect, useState } from "react";
import AnnotationPopup from "./AnnotationPopup";
import { useRecoilValue } from "recoil";
import { viewerState } from "lib/atoms";
import { centroid } from "lib/helpers";

interface AnnotationsProps {
    annotations?: Annotation[];
}

function Annotations({ annotations }: AnnotationsProps) {
    const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation>();
    const viewport = useRecoilValue(viewerState);

    useEffect(() => {
        if (selectedAnnotation) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const screenWidth = (viewport as any)._contentSize.x;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const screenHeight = (viewport as any)._contentSize.y;

            const centre = centroid(selectedAnnotation.geometry, screenWidth, screenHeight);
            viewport?.panTo(centre);
        }

    }, [selectedAnnotation]);

    return (
        <div id="Annotations">
            {annotations ? (
                <>
                    {annotations.map((annotation) => (
                        <div key={annotation.properties.name} className="grid grid-cols-4 p-2 border-b border-t mb-2 cursor-pointer">
                            <div className="col-span-4" onClick={() => setSelectedAnnotation(annotation)}>
                                {annotation.properties.name || "Unnamed annotation" }
                            </div>
                        </div>
                    ))}

                    <div className="border-b text-center bg-blue-500 text-white font-bold text-xl pt-2 pb-2">
                        {selectedAnnotation ? (
                            <AnnotationPopup annotation={selectedAnnotation} />
                        ) :
                            <p>No annotation selected</p>
                        }
                    </div>

                    { /* TODO: Add description of annotations without answers here */ }
                </>
            ) : (
                <p>No annotations</p>
            )}
        </div>
    );
}

export default Annotations;
