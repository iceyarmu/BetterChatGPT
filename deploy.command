#!/bin/sh

currentShellPath=$(cd "$(dirname "$0")"; pwd)
rsync -av "$currentShellPath/src/" "slots-mac:/Users/apple/Software/BetterChatGPT/src/"
