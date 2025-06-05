
// Create a declaration file, e.g., src/types/diff2html.d.ts
declare module 'diff2html' {
    export interface Diff2HtmlConfig {
      drawFileList?: boolean;
      matching?: 'lines' | 'words' | 'none';
      outputFormat?: 'line-by-line' | 'side-by-side';
      synchronisedScroll?: boolean;
      highlight?: boolean;
      renderNothingWhenEmpty?: boolean;
      maxLineLengthHighlight?: number;
      maxLineSizeInBlockForComparison?: number;
      matchingMaxComparisons?: number;
      fileListStartVisible?: boolean;
      // Add other configuration options as needed from diff2html documentation
    }
  
    export function html(diffInput: string, configuration?: Diff2HtmlConfig): string;
    // You can add more functions if you use them, e.g., parse
    // export function parse(diffInput: string, configuration?: Diff2HtmlConfig): DiffFile[];
  }
  