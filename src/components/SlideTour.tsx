import { SlideTourEntry } from "../types";
import { useRecoilState } from "recoil";
import { slideTourActive, slideTourIndex } from "../lib/atoms";

export type Props = {
	entries: SlideTourEntry[];
}

export default function SlideTour({ entries }: Props) {
	const [index, setIndex] = useRecoilState(slideTourIndex);
	const [isSlideTourActive, setSlideTourActive] = useRecoilState(slideTourActive);

	const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

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