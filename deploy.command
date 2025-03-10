#!/bin/sh

currentShellPath=$(cd "$(dirname "$0")"; pwd)
remotePath="slots-mac:/Users/apple/Software/BetterChatGPT"
rsync -av "$currentShellPath/src/" "$remotePath/src/"
rsync -av "$currentShellPath/public/" "$remotePath/public/"
