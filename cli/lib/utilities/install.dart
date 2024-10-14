import 'dart:io';

/// Installs npm dependencies by running 'npm install'.
Future<void> installDependencies() async {
  // Run the npm install command
  final result = await Process.run('npm', ['install']);

  if (result.exitCode == 0) {
    print('Dependencies installed successfully.');
  } else {
    print('Error installing dependencies: ${result.stderr}');
    exit(1);
  }
}