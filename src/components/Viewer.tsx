import { fetchSlideProperties } from "lib/api";
import { selectedAnnotationState, slideTourState } from "lib/atoms";
import EduViewer, { SlideProperties, SlideRepository } from "lib/EduViewer";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import "styles/Viewer.css";
import { Annotation, Slide } from "types";
import "openseadragon/openseadragon-scalebar";
import "openseadragon/openseadragon-svg-overlay";

type Props = {
    slide: Slide | null;
}

async function InitializeOMEROSlide(slide: Slide): Promise<SlideProperties> {
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

async function InitializeOpenMicroanatomySlide(slide: Slide): Promise<SlideProperties> {
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

async function InitializeSlide(slide: Slide): Promise<SlideProperties> {
    if (slide.serverBuilder.providerClassName.includes("OmeroWebImageServerBuilder")) {
        return InitializeOMEROSlide(slide);
    } else if (slide.serverBuilder.providerClassName.includes("EduServerBuilder")) {
        return InitializeOpenMicroanatomySlide(slide);
    } else {
        throw new Error("Unsupported image. Try opening this slide using QuPath Edu");
    }
}

export default function Viewer({ slide }: Props) {
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);

    const cachedAnnotations = useRef<Annotation[]>([])
    const viewer = useRef<EduViewer>();
    const slideTour = useRecoilValue(slideTourState);

    useEffect(() => {
        viewer.current = new EduViewer(setSelectedAnnotation);

        if (slide) OpenSlide(slide);
    }, []);

    useEffect(() => {
        if (selectedAnnotation && viewer.current) {
            viewer.current.ZoomAndPanToAnnotation(selectedAnnotation);
            viewer.current.HighlightAnnotation(selectedAnnotation);
        }
    }, [selectedAnnotation]);

    useEffect(() => {
        if (!slide) return;

        OpenSlide(slide);
    }, [slide]);

    useEffect(() => {
        viewer.current?.ClearAnnotations();

        if (slideTour.active) {
            DrawCurrentSlideTourEntry();
        } else {
            viewer.current?.SetRotation(0);
            viewer.current?.DrawAnnotations(cachedAnnotations.current);
        }
    }, [slideTour]);

    async function OpenSlide(slide: Slide) {
        try {
            const properties = await InitializeSlide(slide);
            const annotations = JSON.parse(slide.annotations || "[]");

            viewer.current?.OpenSlide(properties);
            viewer.current?.ClearAnnotations();
            viewer.current?.DrawAnnotations(annotations || []);
            cachedAnnotations.current = annotations || [];
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unknown error while opening slide");
            console.error(error);
        }
    }

    /**
     * Draw any annotations for this slide tour entry and pan & zoom to correct position.
     */
    function DrawCurrentSlideTourEntry() {
        if (slideTour.entries.length == 0) return;

        const entry = slideTour.entries[slideTour.index];
        const annotations = entry.annotations;

        viewer.current?.PanTo(entry.x, entry.y);
        viewer.current?.ZoomTo(entry.magnification);
        viewer.current?.SetRotation(entry.rotation);

        viewer.current?.ClearAnnotations();
        viewer.current?.DrawAnnotations(annotations || []);
    }

    return <div id="Viewer" className="h-full flex-grow bg-black" />;
}
