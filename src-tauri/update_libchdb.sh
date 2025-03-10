#!/bin/bash
set -e
cd $(dirname "${BASH_SOURCE[0]}")

# Get the newest release version
LATEST_RELEASE=$(curl --silent "https://api.github.com/repos/chdb-io/chdb/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

echo "Latest version found: $LATEST_RELEASE"

# Set ARCH to uname -m if not already set
ARCH=${ARCH:-$(uname -m)}

# Download the correct version based on the platform
case "$(uname -s)" in
    Linux)
        if [[ $ARCH == "aarch64" ]]; then
            PLATFORM="linux-aarch64-libchdb.tar.gz"
        else
            PLATFORM="linux-x86_64-libchdb.tar.gz"
        fi
        ;;
    Darwin)
        if [[ $ARCH == "arm64" ]]; then
            PLATFORM="macos-arm64-libchdb.tar.gz"
        else
            PLATFORM="macos-x86_64-libchdb.tar.gz"
        fi
        ;;
    *)
        echo "Unsupported platform"
        exit 1
        ;;
esac

DOWNLOAD_URL="https://github.com/chdb-io/chdb/releases/download/$LATEST_RELEASE/$PLATFORM"

echo "Downloading $PLATFORM from $DOWNLOAD_URL"

# Download the file
curl -L -o libchdb.tar.gz $DOWNLOAD_URL

# Untar the file
tar -xzf libchdb.tar.gz

# Set execute permission for libchdb.so
chmod +x libchdb.so

# Clean up
rm -f libchdb.tar.gz
