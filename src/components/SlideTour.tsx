import { clamp } from "../lib/helpers";
import { useStore } from "../lib/StateStore";

/**
 * Text to display when slide tour text is undefined. Should ideally match phrase used in QuPath.
 */
const TEXT_MISSING_PLACEHOLDER = "Description not set"

type Props = {
    isMobile?: boolean;
}

export default function SlideTour({ isMobile = false }: Props) {
	// Cannot use hooks inside <SlideTour /> because this is rendered using React.renderToString() later.
    const [ slideTour, setSlideTour ] = [ useStore.getState().slideTour, useStore.getState().setSlideTour ]

	const nextEntry = () => {
		if (slideTour.index == slideTour.entries.length - 1) return;

		setSlideTour({
			...slideTour,
			index: clamp(slideTour.index + 1, 0 , slideTour.entries.length - 1)
		});
	}

	const previousEntry = () => {
		if (slideTour.index == 0) return;

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
		} catch {
			return str;
		}
	}

	const getSlideTourText = () => {
		return slideTour.entries[slideTour.index]?.text || TEXT_MISSING_PLACEHOLDER;
	}

	const isFirstFrame = () => {
		return slideTour.index == 0;
	}

	const isLastFrame = () => {
		return slideTour.index == slideTour.entries.length - 1;
	}

	if (slideTour.entries.length == 0) {
		return null;
	}

	if (!slideTour.active) {
		return (
			<div
				className="m-[10px] cursor-pointer py-2 px-4 text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
				onClick={startTour}
			>
				Start slide tour
			</div>
		);
	}

	if (isMobile) {
		return (
			<div className="flex flex-col bg-blue-500 text-white text-sm max-h-[30%]">
				<div className="p-2 whitespace-pre-wrap overflow-auto">{ fixLegacyStringEncoding(getSlideTourText()) }</div>

				<div className="flex">
				    <div onClick={endTour} className="py-2 px-4 bg-red-500">x</div>

                    <div className="flex ml-auto gap-2">
                        <div onClick={previousEntry} className={`py-2 px-4 ${isFirstFrame() ? 'bg-gray-300 text-gray-500' : ' bg-blue-600'}`}>&lt;</div>
                        <div onClick={nextEntry} className={`py-2 px-4 ${isLastFrame() ? 'bg-gray-300 text-gray-500' : ' bg-blue-600'}`}>&gt;</div>
                    </div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col bg-white rounded-lg p-2 gap-2 border border-gray-300 w-[320px] m-[10px]">
			<div className="flex flex-row gap-2 justify-evenly text-white font-semibold text-center">
				<div onClick={previousEntry} className={`rounded-lg py-1 px-4 ${isFirstFrame() ? 'bg-gray-500' : ' bg-blue-500 cursor-pointer hover:bg-blue-600'}`}>Previous</div>
				<div onClick={nextEntry} className={`rounded-lg py-1 px-4 ${isLastFrame() ? 'bg-gray-500' : ' bg-blue-500 cursor-pointer hover:bg-blue-600'}`}>Next</div>

                <button
                    className="inline-flex items-center justify-center cursor-pointer bg-blue-500 hover:bg-blue-600 p-2 w-[32px] h-[32px] rounded-lg text-white ml-auto"
                    onClick={endTour}
                >
                    &#10005;
                </button>
			</div>

            <div className="flex">
                <p className="text-slate-800 text-sm whitespace-pre-wrap">{ fixLegacyStringEncoding(getSlideTourText()) }</p>
            </div>
		</div>
	);
}