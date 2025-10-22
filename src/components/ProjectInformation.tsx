import { useStore } from "../lib/StateStore";

export default function ProjectInformation() {
    const [ project ] = useStore(state => [ state.project ]);

    const styles = `<link rel="stylesheet" href="ckeditor.css" />`;

    return (
      <div className="p-2 h-full">
          {project?.projectInformation ? (
            <iframe srcDoc={styles + project.projectInformation} className="w-full h-full" />
          ) : (
            <p className="flex h-full items-center justify-center font-bold text-slate-600 text-center">No additional information available for this lesson.</p>
          )}
      </div>
    );
}
