import { useRecoilState } from "recoil";
import { useMediaQuery } from "react-responsive";
import { clamp } from "../lib/helpers";
import { slideTourState } from "../lib/atoms";

export default function SlideTour() {
	const [slideTour, setSlideTour] = useRecoilState(slideTourState);

	// Same as Tailwind 'lg'
	const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });

	const nextEntry = () => {
		setSlideTour({
			...slideTour,
			index: clamp(slideTour.index + 1, 0 , slideTour.entries.length - 1)
		});
	}

	const previousEntry = () => {
		setSlideTour({
			...slideTour,
			index: clamp(slideTour.index - 1, 0 , slideTour.entries.length - 1)
		});
	}

	const startTour = () => {
		setSlideTour({
			...slideTour,
			active: true,
			index: 0,
		});
	}

	const endTour = () => {
		setSlideTour({
			...slideTour,
			active: false,
			index: 0
		});
	}

	/**
	 * Slide tours were previously saved with incorrect character encoding, causing issues with umlauts.
	 * This function fixes any weird characters caused by incorrect encoding.
	 * @Deprecated to be removed in version 1.1
	 */
	const fixLegacyStringEncoding = (str: string) => {
		try {
			return decodeURIComponent(escape(str));
		} catch(e) {
			return str;
		}
	}

	const getSlideTourText = () => {
		return slideTour.entries[slideTour.index]?.text;
	}

	const isFirstFrame = () => {
		return slideTour.index == 0;
	}

	const isLastFrame = () => {
		return slideTour.index == slideTour.entries.length - 1;
	}

	if (slideTour.entries.length == 0) {
		return <></>;
	}

	if (!slideTour.active) {
		return (
			<div
				className="cursor-pointer sticky bottom-0 border-b py-2 mt-2 text-center bg-blue-500 text-white font-bold"
				onClick={startTour}
			>
				Start slide tour
			</div>
		);
	}

	if (isMobile) {
		return (
			<div className="flex flex-row bg-blue-500 rounded-b-sm text-white text-sm max-h-[30%]">
				<div onClick={endTour} className="self-start p-2 bg-red-500 aspect-square">x</div>

				<div className="p-2 whitespace-pre-wrap overflow-auto">{ fixLegacyStringEncoding(getSlideTourText()) }</div>

				<div className="flex flex-row self-end ml-auto gap-1">
					<div onClick={previousEntry} className={`py-2 px-4 ${isFirstFrame() ? 'bg-gray-300 text-gray-500' : ' bg-blue-600'}`}>&lt;</div>
					<div onClick={nextEntry} className={`py-2 px-4 ${isLastFrame() ? 'bg-gray-300 text-gray-500' : ' bg-blue-600'}`}>&gt;</div>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="flex flex-row mt-2 justify-evenly text-white font-bold text-center divide-x divide-solid">
				<div onClick={endTour} className="flex-1 py-2 cursor-pointer bg-blue-500">Exit tour</div>
				<div onClick={previousEntry} className={`flex-1 py-2 ${isFirstFrame() ? 'bg-gray-500' : ' bg-blue-500 cursor-pointer'}`}>Previous</div>
				<div onClick={nextEntry} className={`flex-1 py-2 ${isLastFrame() ? 'bg-gray-500' : ' bg-blue-500 cursor-pointer'}`}>Next</div>
			</div>

			<div className="p-2 whitespace-pre-wrap">{ fixLegacyStringEncoding(getSlideTourText()) }</div>
		</>
	);
}