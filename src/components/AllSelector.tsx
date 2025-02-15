import { EduServer } from "../types";
import { useStore } from "../lib/StateStore";
import ServerSelector from "./ServerSelector";
import OrganizationSelector from "./OrganizationSelector";
import ProjectSelector from "./ProjectSelector";

type Props = {
	servers: EduServer[];
}

export function AllSelector({ servers }: Props) {
	const [ server, organization ] = useStore(state => [
		state.server, state.organization
	]);

	return (
		<div className="flex flex-col mx-auto box-content h-full w-full max-w-md bg-white overflow-hidden md:border md:rounded-lg md:shadow-md">
			<div className="p-4 flex flex-col gap-4 bg-gray-50 shadow">
				<header className="my-4">
					<h1 className="font-serif text-2xl text-center sm:text-4xl">OpenMicroanatomy</h1>
				</header>

				<ServerSelector servers={servers} />

				{ server && <OrganizationSelector /> }
			</div>

			<div className="flex-grow overflow-y-auto scrollbar">
				{(server && organization) ? (
					<ProjectSelector />
				) : (
					<p className="h-full flex items-center justify-center font-bold text-slate-600">Select organization to continue</p>
				)}
			</div>
		</div>
	);
}
