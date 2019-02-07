// Files
function fetchFiles() {}

function downloadFile() {}

function downloadFiles() {}

function uploadFiles() {}

function changeFileName() {}

function changeFileDescription() {}

function changeFileTags() {}

function recoverFiles() {}

function deleteFile() {}

function deleteFileForce() {}

// Tags
function fetchTags() {}

function addTag() {}

function changeTag() {}

function deleteTag() {}

const API = {
    files: {
        fetch: fetchFiles,
        downloadFile: downloadFile,
        downloadFiles: downloadFiles,
        //
        uploadFiles: uploadFiles,
        //
        rename: changeFileName,
        changeTags: changeFileTags,
        changeDescription: changeFileDescription,
        //
        recoverFiles: recoverFiles,
        delete: deleteFile,
        deleteForce: deleteFileForce
    },
    tags: {
        fetch: fetchTags,
        add: addTag,
        change: changeTag,
        delete: deleteTag
    }
};

export default API;
