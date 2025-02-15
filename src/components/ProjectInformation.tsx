type Props = {
    data: string
}

export default function ProjectInformation({ data }: Props) {
    const styles = `<link rel="stylesheet" href="ckeditor.css" />`;

    return (
      <div className="p-2 h-full">
          {data ? (
            <iframe srcDoc={styles + data} className="w-full h-full"></iframe>
          ) : (
            <p className="flex h-full items-center justify-center font-bold text-slate-600 text-center">No additional information available for this lesson.</p>
          )}
      </div>
    );
}
