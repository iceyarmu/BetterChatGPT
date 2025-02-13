#!/bin/sh
SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)
DIR_NAME=$(basename "$SCRIPT_DIR")
tail -f "$SCRIPT_DIR/$DIR_NAME.log"