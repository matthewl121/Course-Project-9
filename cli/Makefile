# Get all arguments passed to make
ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))

# Default target
all:
ifeq ($(strip $(ARGS)),)
	@echo "Usage: make run <arg> ..."
	@exit 1
endif 

run: 
	dart run bin/main.dart $(ARGS)

compile: 
	@# Check if any line in .bashrc matches dart-sdk
	@if grep -q "dart-sdk" ~/.bashrc; then \
		echo "Dart SDK is already in PATH."; \
	else \
		DART_SDK_DIR="$$PWD/dart-sdk"; \
		DART_SDK_URL="https://storage.googleapis.com/dart-archive/channels/stable/release/3.5.1/sdk/dartsdk-linux-x64-release.zip"; \
		\
		if [ ! -d "$$DART_SDK_DIR" ]; then \
			echo "dart-sdk not found. Downloading..."; \
			curl -O "$$DART_SDK_URL"; \
			unzip dartsdk-linux-x64-release.zip; \
			echo "Dart SDK has been downloaded and extracted."; \
		else \
			echo "dart-sdk already exists."; \
		fi; \
		\
		CURRENT_DIR=$$PWD; \
		NEW_PATH="$$CURRENT_DIR/dart-sdk/bin"; \
		\
		echo "Adding Dart SDK to PATH."; \
		echo "export PATH=\"\$$PATH:$$NEW_PATH\"" >> ~/.bashrc; \
		export PATH="$$PATH:$$NEW_PATH"; \
		source ~/.bashrc; \
	fi
	dart compile exe bin/main.dart -o ../run; 

# Catch-all target to prevent "make: *** No rule to make target ..." errors
%:
	@: