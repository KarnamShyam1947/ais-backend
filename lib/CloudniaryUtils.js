const extractPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const versionIndex = parts.findIndex(p => p.startsWith('v')) + 1;
    const publicIdWithExt = parts.slice(versionIndex).join('/'); 
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); 

    return publicId;

}

module.exports = { extractPublicIdFromUrl }
