#!/bin/bash
set -ex

THIS_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "INFO : Installing NPM dependencies..."
npm install --prefix $THIS_SCRIPT_DIR dropbox-v2-api --save

echo "INFO : Launching step script to upload file on dropbox..."

val=$($THIS_SCRIPT_DIR/dropbox.js "${dropbox_secret}" "${dropbox_local_path}" "${dropbox_remote_path}")
echo $val
envman add --key DROPBOX_FILE_SHARED_LINK --value val
