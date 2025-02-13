#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)
DIR_NAME=$(basename "$SCRIPT_DIR")
if [ ! -f "/tmp/$DIR_NAME" ]; then
  echo "first run, wait 15s"
  touch "/tmp/$DIR_NAME"
  sleep 15
fi

while true; do
cd "$SCRIPT_DIR"
./start.sh
sleep 15
done
