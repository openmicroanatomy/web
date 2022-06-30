import "reactjs-popup/dist/index.css";
import { Annotation } from "types";
import { useEffect, useState } from "react";
import AnnotationPopup from "./AnnotationPopup";
import { useRecoilValue } from "recoil";
import { viewerState } from "lib/atoms";
import { area, centroid } from "lib/helpers";

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

            const annotationArea = area(selectedAnnotation.geometry);
            const slideArea = (viewport?.getContainerSize().x ?? 1) * (viewport?.getContainerSize().y ?? 1);

            viewport?.zoomTo(viewport?.imageToViewportZoom(slideArea / annotationArea));
        }
    }, [selectedAnnotation]);

    return (
        <div id="Annotations" className="py-2">
            {annotations && annotations?.length > 0 ? (
                <>
                    {annotations.map((annotation) => (
                        <div
                            className="grid grid-cols-4 p-2 border-b border-t mb-2 cursor-pointer"
                        >
                            <div className="col-span-4" onClick={() => setSelectedAnnotation(annotation)}>
                                {annotation.properties.name || "Unnamed annotation"}
                            </div>
                        </div>
                    ))}

                    <div className="border-b text-center bg-blue-500 text-white font-bold text-xl pt-2 pb-2">
                        {selectedAnnotation ? (
                            <AnnotationPopup annotation={selectedAnnotation} />
                        ) : (
                            <p>No annotation selected</p>
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
