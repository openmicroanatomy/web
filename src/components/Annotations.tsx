import { overlayState, selectedAnnotationState, viewportState } from "lib/atoms";
import { area, centroid, clamp } from "lib/helpers";
import { useEffect } from "react";
import "reactjs-popup/dist/index.css";
import { useRecoilState, useRecoilValue } from "recoil";
import { Annotation } from "types";
import AnnotationPopup from "./AnnotationPopup";
import { sha1 } from "object-hash";

interface AnnotationsProps {
    annotations?: Annotation[];
}

function Annotations({ annotations }: AnnotationsProps) {
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);
    const viewport = useRecoilValue(viewportState);
    const overlay = useRecoilValue(overlayState);

    // TODO: Move this to a seperate helper class which runs always. 
    //       If the user does not have the "Annotations" tab active, these effects
    //       do not run until the user re-opens the annotations tab thus making
    //       it impossible to focus on annotations by clicking them.
    useEffect(() => {
        if (selectedAnnotation) {
            PanToCurrentAnnotation(selectedAnnotation);
            ZoomToCurrentAnnotation(selectedAnnotation);
            HighlightCurrentAnnotation(selectedAnnotation);
        }
    }, [selectedAnnotation]);

    const PanToCurrentAnnotation = (annotation: Annotation) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const screenWidth = (viewport as any)._contentSize.x;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const screenHeight = (viewport as any)._contentSize.y;

        const centre = centroid(annotation.geometry, screenWidth, screenHeight);
        viewport?.panTo(centre);
    }

    // TODO: This doesn't work on very large or small annotations, but clamping the zoom partially fixes this.
    const ZoomToCurrentAnnotation = (annotation: Annotation) => {
        if (!viewport) return;

        const annotationArea = area(annotation.geometry);
        const slideArea = viewport.getContainerSize().x * viewport.getContainerSize().y;

        const MaxZoom = viewport.getMaxZoom();
        const MinZoom = viewport.getMinZoom();
        const NewZoom = viewport.imageToViewportZoom(slideArea / annotationArea);

        viewport.zoomTo(clamp(NewZoom, MinZoom, MaxZoom));
    }

    const HighlightCurrentAnnotation = (annotation: Annotation) => {
        const SelectedAnnotationHash = sha1(annotation.geometry.coordinates[0]);

        // First remove any highlight by removing the `selected--annotation` class from every annotation
        window.d3
            .select(overlay.node())
            .selectAll(".annotation")
            .classed("selected--annotation", false)

        // Now add the `selected--annotation` class to our selected annotation
        window.d3
            .select(overlay.node())
            .selectAll(".annotation")
            .filter(function(d) { 
                // Check that we have valid data
                if (Array.isArray(d)) {
                    const CurrentAnnotationHash = sha1(d);

                    return SelectedAnnotationHash == CurrentAnnotationHash;
                } 

                return false 
            })
            .classed("selected--annotation", true);
    };

    return (
        <div id="Annotations" className="py-2">
            {annotations && annotations?.length > 0 ? (
                <>
                    {annotations.map((annotation) => (
                        <div
                            className="grid grid-cols-4 p-2 border-b border-t mb-2 cursor-pointer"
                            key={sha1(annotation)}
                        >
                            <div className={`col-span-4 ${selectedAnnotation == annotation && "font-bold"}`} onClick={() => setSelectedAnnotation(annotation)}>
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
