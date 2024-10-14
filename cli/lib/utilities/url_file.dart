import 'dart:io';

/// Function to process all URLs in a file and save the results as NDJSON
void processUrlsFromFile(String urlFile, String outputFile) async {
  try {
    // Check if the URL file exists
    if (!File(urlFile).existsSync()) {
      exit(1);
    }

    // Execute the TypeScript file using ts-node
    final result = await Process.run('npx',
        ['ts-node', 'cli/lib/models/UrlProcessor.ts', urlFile, outputFile]);

    print(result.stdout); // Print the output of the TypeScript execution

    // Check if the TypeScript execution was successful
    if (result.exitCode == 0) {
      exit(0); // Exit with success
    } else {
      exit(1); // Exit with failure
    }
  } catch (e) {
    exit(1); // Exit with failure
  }
}
