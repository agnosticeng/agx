#!/bin/bash

if [ "$(uname -s)" != "Darwin" ]; then
  echo "Signing on macOS only"
  exit 0
fi

if [ -n "$CI" ]; then
  # CI environment: search in dynamic path
  APP_PATH=$(find src-tauri/target -path "*/release/agx" -type f)
else
  # Local environment: use fixed path
  APP_PATH="src-tauri/target/release/agx"
fi

install_name_tool -change libchdb.so @executable_path/../Resources/libchdb.so "$APP_PATH"
codesign --force --sign - "$APP_PATH"
