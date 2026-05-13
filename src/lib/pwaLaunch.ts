// Holds a file launched by the OS until the BlockViewer route picks it up.
let pendingFile: File | null = null;

export function setPendingLaunchedFile(file: File) {
    pendingFile = file;
}

export function consumePendingLaunchedFile(): File | null {
    const f = pendingFile;
    pendingFile = null;
    return f;
}
