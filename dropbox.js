#!/usr/bin/env node

const dropboxV2Api = require('dropbox-v2-api');
const fs = require('fs');

let dropbox_secret = process.argv[3];
let dropbox_local_path = process.argv[4];
let dropbox_remote_path = process.argv[5];

if (!dropbox_secret || !dropbox_local_path || !dropbox_remote_path){
  console.log(`ERROR : dropbox_secret : ${dropbox_secret}`);
  console.log(`ERROR : dropbox_local_path : ${dropbox_local_path}`);
  console.log(`ERROR : dropbox_remote_path : ${dropbox_remote_path}`);
  return ;
}

// create session ref:
const dropbox = dropboxV2Api.authenticate({
    token: dropbox_secret
});

const uploadStream = dropbox({
    resource: 'files/upload',
    parameters: {
        "path": dropbox_remote_path,
        "mode": "overwrite",
        "autorename": true,
        "mute": false,
        "strict_conflict": false
    }
}, (err, result, response) => {
    if (err) { return console.log(err); }
    createLink();
});

function createLink() {
    dropbox({
        resource: 'sharing/create_shared_link_with_settings',
        parameters: {
            "path": dropbox_remote_path,
            "settings": {
                "audience": "public",
                "access": "viewer",
                "requested_visibility": "public",
                "allow_download": true
            }
        }
    }, (err, result, response) => {
    if (err) {
        if (err.error[".tag"] == 'shared_link_already_exists') {
            linkExist();
        } else {
            return console.log(err); 
        }
    } else {
        return console.log(parseURL(result));
    }
    });
}

function linkExist() {
    dropbox({
        resource: 'sharing/list_shared_links',
        parameters: {
            "path": dropbox_remote_path,
        }
    }, (err, result, response) => {
    if (err) { return console.log(err); }
        return console.log(parseURL(result));
    });
}

function parseURL(result) {
    var url;
    if (result["url"]) {
         url = result["url"];
    } else if (result.links[0].url) {
         url = result.links[0].url;
    }
    url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com");
    url = url.replace("?dl=0", "");
    return url
}

//use nodejs stream
fs.createReadStream(dropbox_local_path).pipe(uploadStream);