Team Members:
  - Leo Chen: chen3900@purdue.edu
  - Lane Crowder: crowderl@purdue.edu
  - Lawrence Smith: smit4407@purdue.edu
  - Shashwat Misra: misra22@purdue.edu

# A CLI for Trustworthy Module Re-Use
Purpose
The CLI tool is designed to help ACME Corporation assess the trustworthiness of open-source modules for reuse in their infrastructure. It evaluates repositories based on key metrics such as NetScore, RampUp, Correctness, BusFactor, License, and ResponsiveMaintainer. These metrics ensure that open-source modules meet ACME's standards of quality, maintainability, and responsiveness, helping the company make informed decisions about integrating external software components.

# Installation
1. Cloning the Repository
Clone the GitHub repository to your local machine:
git clone https://github.com/ECE-461-Team-9/Course-Project

2. Navigating to the CLI Directory
Note: make sure to follow the environmental setup for logging and the github token below.
Before using the tool, you need to compile the CLI source files. Navigate to the cli directory and run the compile command:
cd cli
make compile

Once the compilation is complete, return to the root directory:
cd ..

3. Installing Dependencies
Run the following command from the root directory to install all required dependencies:
./run install

This command installs necessary dependencies in userland and exits with a return code 0 on success


How to Invoke the CLI
1. Running the Tool on a URL File
To run the CLI tool and analyze repositories listed in a URL file, use:
bash
./run URL_FILE

The tool processes the URLs provided in the file and outputs NDJSON format with the following fields for each repository:
URL
NetScore, NetScore_Latency
RampUp, RampUp_Latency
Correctness, Correctness_Latency
BusFactor, BusFactor_Latency
ResponsiveMaintainer, ResponsiveMaintainer_Latency
License, License_Latency
Each score is in the range [0, 1], where 0 indicates failure and 1 indicates perfection. The exit code will be 0 on success, with parsed output, and non-zero on failure.

# Testing the Tool
To run the test suite, use:
./run test

The test suite contains at least 20 distinct test cases and achieves over 80% code coverage. You will see output in the following format:
arduino
X/Y test cases passed. Z% line coverage achieved.

This ensures that the system has passed all critical tests and meets the quality requirements.

# System Logging
Logging is handled based on two environment variables:
LOG_FILE: Specifies the file where logs will be stored.
LOG_LEVEL: Controls the verbosity of the logging system:
0 (OFF): No logging
1 (INFO): Logs informational messages
2 (DEBUG): Logs detailed debug information
Logs capture key events, including metric calculations, errors, and general status updates. The log file is stored at the location specified by $LOG_FILE. The verbosity can be adjusted based on the value of $LOG_LEVEL. When set to 0, logs are silent, while higher values provide more detailed information.

# Parallel Metric Calculation
The tool calculates metrics in parallel to improve performance and reduce latency. It takes advantage of multiple CPU cores when available to process repositories efficiently. The number of cores used is optimized based on system resources, ensuring that metrics are calculated quickly while maintaining accuracy.

# License Check
The tool evaluates the license compatibility of the repository, ensuring it complies with ACME Corporation's required LGPLv2.1 standard. It checks either the LICENSE file in the root directory or a license section within the project README. This ensures that the module’s license is compatible with ACME’s legal requirements.

# GitHub Token Usage
To interact with the GitHub API for metrics like ResponsiveMaintainer and BusFactor, the tool requires a valid GitHub token. Ensure the $GITHUB_TOKEN environment variable is set with your token:
GITHUB_TOKEN=your_token_here


If an invalid token is used, the tool will exit with an error code 1 and display an appropriate error message.

# Reasonable Looking Test Suite
The CLI tool includes a test suite that has been carefully designed to ensure the reliability of the system. Each metric and key functionality has at least one test case, ensuring robustness across multiple scenarios, including edge cases.

# Documentation
The project is accompanied by this README, which explains the purpose of the tool, how to configure it, and how to invoke it. It also provides guidance on running tests and configuring logging for development and production environments.

# Contribution and License
This project is open-source and publicly available on GitHub. To contribute or learn more about licensing, refer to the GitHub repository at: https://github.com/ECE-461-Team-9/Course-Project

# Effective Communication
The codebase follows consistent naming conventions, and variables and functions are named clearly to ensure that the code is readable and maintainable. The system is structured to be modular, making it easy for future contributors to understand and extend.

# Planning Ahead and Dropping Features
If any features need to be dropped, they will be clearly communicated to Sarah and the team well in advance. This will allow us to adjust timelines and deliver the highest quality tool within the project constraints

