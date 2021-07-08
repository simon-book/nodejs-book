var Minio = require('minio')

var minioClient = new Minio.Client({
    endPoint: __MOSS__.endPoint,
    port: __MOSS__.port,
    useSSL: __MOSS__.useSSL,
    accessKey: __MOSS__.accessKey,
    secretKey: __MOSS__.secretKey
});

minioClient.put = function(bucketName, objectName, string) {
    return new Promise(function(resolve, reject) {
        minioClient.putObject(bucketName, objectName, string, function(err, etag) {
            if (err) resolve(false);
            else resolve({
                etag: etag,
                bucketName: bucketName,
                objectName: objectName
            });
        })
    });
}

minioClient.get = function(bucketName, objectName) {
    return new Promise(function(resolve, reject) {
        minioClient.getObject(bucketName, objectName, function(err, dataStream) {
            if (err) {
                resolve(false);
                return;
            }
            var _data = "";
            dataStream.on('data', function(chunk) {
                _data += chunk;
            })
            dataStream.on('end', function() {
                resolve(_data);
            })
            dataStream.on('error', function(err) {
                resolve(false);
            })
        })
    });
}

minioClient.getStream = function(bucketName, objectName) {
    return new Promise(function(resolve, reject) {
        minioClient.getObject(bucketName, objectName, function(err, dataStream) {
            if (err) {
                resolve(false);
                return;
            }
            resolve(dataStream);
        })
    });
}

module.exports = minioClient;