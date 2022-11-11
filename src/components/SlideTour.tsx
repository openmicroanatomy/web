import { SlideTourEntry } from "../types";
import { useRecoilState } from "recoil";
import { slideTourActive, slideTourIndex } from "../lib/atoms";
import { useMediaQuery } from "react-responsive";
import { clamp } from "../lib/helpers";

export type Props = {
	entries: SlideTourEntry[];
}

export default function SlideTour({ entries }: Props) {
	const [index, setIndex] = useRecoilState(slideTourIndex);
	const [isSlideTourActive, setSlideTourActive] = useRecoilState(slideTourActive);

	// Same as Tailwind 'lg'
	const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });

	const nextEntry = () => {
		setIndex(index => clamp(index + 1, 0, entries.length - 1));
	}

	const previousEntry = () => {
		setIndex(index => clamp(index - 1, 0 , entries.length - 1));
	}

	const startTour = () => {
		setIndex(0);
		setSlideTourActive(true);
	}

	const endTour = () => {
		setSlideTourActive(false);
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

	if (entries.length == 0) {
		return <></>;
	}

	if (!isSlideTourActive) {
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

				<div className="p-2 whitespace-pre-wrap overflow-auto">{ fixLegacyStringEncoding(entries[index]?.text) }</div>

				<div className="flex flex-row self-end ml-auto gap-1">
					<div onClick={previousEntry} className={`py-2 px-4 ${index == 0 ? 'bg-gray-300 text-gray-500' : ' bg-blue-600'}`}>&lt;</div>
					<div onClick={nextEntry} className={`py-2 px-4 ${index == entries.length - 1 ? 'bg-gray-300 text-gray-500' : ' bg-blue-600'}`}>&gt;</div>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="flex flex-row mt-2 justify-evenly text-white font-bold text-center divide-x divide-solid">
				<div onClick={endTour} className="flex-1 py-2 cursor-pointer bg-blue-500">Exit tour</div>
				<div onClick={previousEntry} className={`flex-1 py-2 ${index == 0 ? 'bg-gray-500' : ' bg-blue-500 cursor-pointer'}`}>Previous</div>
				<div onClick={nextEntry} className={`flex-1 py-2 ${index == entries.length - 1 ? 'bg-gray-500' : ' bg-blue-500 cursor-pointer'}`}>Next</div>
			</div>

			<div className="p-2 whitespace-pre-wrap">{ fixLegacyStringEncoding(entries[index]?.text) }</div>
		</>
	);
}