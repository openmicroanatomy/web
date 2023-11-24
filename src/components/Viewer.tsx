import { fetchSlideProperties } from "lib/api";
import { selectedAnnotationState, slideTourState } from "lib/atoms";
import EduViewer, { SlideProperties, SlideRepository } from "lib/EduViewer";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import "styles/Viewer.css";
import { Annotation, Image } from "types";
import "openseadragon/openseadragon-scalebar";
import "openseadragon/openseadragon-svg-overlay";
import OpenSeadragon from "openseadragon";

interface Props {
    slide?: Image | null;
}

async function InitializeOMEROSlide(slide: Image): Promise<SlideProperties> {
    const slideId = slide.serverBuilder.uri.split("?show=image-")[1];
    const data = await fetchSlideProperties(slideId, SlideRepository.OMERO);

    const levelCount = parseInt(data.levels) || 1
    const downsamples = [];

    if (levelCount > 1) {
        for (let i = 0; i < levelCount; i++) {
            downsamples.push(1 / data.zoomLevelScaling[i]);
        }
    } else {
        downsamples.push(1);
    }

    return {
        repository: SlideRepository.OMERO,
        levelCount: levelCount,
        downsamples: downsamples,
        slideHeight: parseInt(data.size.height),
        slideWidth: parseInt(data.size.width),
        tileWidth: data.tiles ? data.tile_size.width : data.size.width,
        tileHeight: data.tiles ? data.tile_size.height : data.size.height,
        serverUri: `https://idr.openmicroscopy.org/webgateway/render_image_region/${data.id}/0/0/?tile={level},{tileX},{tileY},{tileWidth},{tileHeight}`,
        millimetersPerPixel: parseFloat(data.pixel_size.x) * 10,
        getTileUrl: (level, x, y, properties) => {
            level = properties.levelCount - level - 1;

            return properties.serverUri
                .replaceAll("{tileX}", String(x))
                .replaceAll("{tileY}", String(y))
                .replaceAll("{level}", String(level))
                .replaceAll("{tileWidth}", String(properties.tileWidth))
                .replaceAll("{tileHeight}", String(properties.tileHeight));
        }
    } satisfies SlideProperties;
}

async function InitializeOpenMicroanatomySlide(slide: Image): Promise<SlideProperties> {
    const slideId = new URL(slide.serverBuilder.uri).pathname.substr(1);
    const data = await fetchSlideProperties(slideId, SlideRepository.OpenMicroanatomy);

    const levelCount = parseInt(data["openslide.level-count"]);
    const downsamples = [];

    for (let i = 0; i < levelCount; i++) {
        const downsample = parseInt(data["openslide.level[" + i + "].downsample"]);
        downsamples.push(Math.floor(downsample));
    }

    return {
        repository: SlideRepository.OpenMicroanatomy,
        levelCount: levelCount,
        downsamples: downsamples,
        slideHeight: parseInt(data["openslide.level[0].height"]),
        slideWidth: parseInt(data["openslide.level[0].width"]),
        tileWidth: parseInt(data["openslide.level[0].tile-height"]),
        tileHeight: parseInt(data["openslide.level[0].tile-width"]),
        serverUri: data["openslide.remoteserver.uri"],
        millimetersPerPixel: parseFloat(data["aperio.MPP"]),
        getTileUrl: (level, x, y, properties) => {
            level = properties.levelCount - level - 1;

            const downsample = properties.downsamples[level];

            const tileY = y * properties.tileHeight * downsample;
            const tileX = x * properties.tileWidth  * downsample;

            let adjustY = 0;
            let adjustX = 0;

            if (tileX + downsample * properties.tileWidth > properties.slideWidth) {
                adjustX = properties.tileWidth - Math.floor(Math.abs((tileX - properties.slideWidth) / downsample));
            }

            if (tileY + downsample * properties.tileHeight > properties.slideHeight) {
                adjustY = properties.tileHeight - Math.floor(Math.abs((tileY - properties.slideHeight) / downsample));
            }

            const height = properties.tileHeight - adjustY;
            const width  = properties.tileWidth  - adjustX;

            return properties.serverUri
                .replaceAll("{tileX}", String(tileX))
                .replaceAll("{tileY}", String(tileY))
                .replaceAll("{level}", String(level))
                .replaceAll("{tileWidth}", String(width))
                .replaceAll("{tileHeight}", String(height));
        }
    } satisfies SlideProperties;
}

async function InitializeSlide(slide: Image): Promise<SlideProperties> {
    if (slide.serverBuilder.providerClassName.includes("OmeroWebImageServerBuilder")) {
        return InitializeOMEROSlide(slide);
    } else if (slide.serverBuilder.providerClassName.includes("EduServerBuilder")) {
        return InitializeOpenMicroanatomySlide(slide);
    } else {
        throw new Error("Unsupported image. Try opening this slide using QuPath Edu");
    }
}

function Viewer({ slide }: Props) {
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);
    const [viewer, setViewer] = useState<EduViewer>();
    const [cachedAnnotations, setCachedAnnotations] = useState<Annotation[]>([]);

    const slideTour = useRecoilValue(slideTourState);

    useEffect(() => {
        setViewer(new EduViewer(OpenSeadragon({
            id: "Viewer",
            defaultZoomLevel: 0,
            //debugMode: import.meta.env.PROD,
            showNavigator: true,
            navigatorSizeRatio: 0.15,
            navigatorAutoFade: false,
            showNavigationControl: false,
            zoomPerScroll: 1.4,
            gestureSettingsMouse: {
                clickToZoom: false,
                dblClickToZoom: true,
            }
        }), setSelectedAnnotation));
    }, []);

    useEffect(() => {
        if (selectedAnnotation && viewer) {
            viewer.ZoomAndPanToAnnotation(selectedAnnotation);
            viewer.HighlightAnnotation(selectedAnnotation);
        }
    }, [selectedAnnotation]);

    useEffect(() => {
        if (!slide) return;

        InitializeSlide(slide)
            .then(properties => {
                const annotations = JSON.parse(slide.annotations || "[]");

                viewer?.OpenSlide(properties);
                viewer?.ClearAnnotations();
                viewer?.DrawAnnotations(annotations || []);

                setCachedAnnotations(annotations || []);
            })
            .catch((error) => {
                toast.error(error.message);
                console.error(error);
            });
    }, [slide, viewer]);
    // This hook needs to also run when Viewer changes because the setViewer() function is
    // async and has not finished unless the user has already opened the Viewer tab.

    useEffect(() => {
        viewer?.ClearAnnotations();

        if (slideTour.active) {
            DrawCurrentSlideTourEntry();
        } else {
            viewer?.SetRotation(0);
            viewer?.DrawAnnotations(cachedAnnotations);
        }
    }, [slideTour]);

    /**
     * Draw any annotations for this slide tour entry and pan & zoom to correct position.
     */
    function DrawCurrentSlideTourEntry() {
        if (slideTour.entries.length == 0) return;

        const entry = slideTour.entries[slideTour.index];
        const annotations = entry.annotations;

        viewer?.PanTo(entry.x, entry.y);
        viewer?.ZoomTo(entry.magnification);
        viewer?.SetRotation(entry.rotation);

        viewer?.ClearAnnotations();
        viewer?.DrawAnnotations(annotations || []);
    }

    return <div id="Viewer" className="h-full flex-grow bg-black" />;
}

export default Viewer;
