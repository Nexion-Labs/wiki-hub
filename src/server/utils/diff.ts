export interface DiffResult {
  added: string[];
  removed: string[];
  unchanged: number;
}

export const calculateDiff = (oldText: string, newText: string): DiffResult => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const added: string[] = [];
  const removed: string[] = [];
  let unchanged = 0;

  // Simple line-by-line comparison
  // In production, use a library like diff or fast-diff
  const maxLength = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLength; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      unchanged++;
    } else {
      if (oldLine !== undefined && newLine === undefined) {
        removed.push(oldLine);
      } else if (oldLine === undefined && newLine !== undefined) {
        added.push(newLine);
      } else if (oldLine !== newLine) {
        if (!newLines.includes(oldLine)) {
          removed.push(oldLine);
        }
        if (!oldLines.includes(newLine)) {
          added.push(newLine);
        }
      }
    }
  }

  return { added, removed, unchanged };
};
