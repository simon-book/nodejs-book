var NodeRSA = require('node-rsa');

var privateKeyData = "-----BEGIN PRIVATE KEY-----\nMIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA7udvyy09uk4jOlHJ\nqdJ3Z6oPbsiJtQUKC/zZ8wxfPLBRw7UDYv0BkI1TJ928k9H8KjL22SvIo2/NK1yJ\ncy6gLwIDAQABAkBaReGcaI/2oif1lYoaPYkZBs2mEujWGf1d4kGI8ZfbGhoVBTrN\nsZezeT6xGgfMXqvilVuD6xWCKmLz9BzIw11BAiEA/epo3uaYEmLx3cNGMPzkLbI3\nrfo69c4cwWsVFRH40XcCIQDw3XseS2PYQlBioxCcGto0LXSVulwyF3HXIRcGleOV\nCQIgStJ4dLaeuUxO2XphhK4AzzZlEe9a0HQcJSLY44yYNaECIQDkozj1ftbeN8Sa\nfPONWyf6E5PxdR+DJSIY9f4ncCzCEQIgBiRyal78jx6FA7VJNvUHES9yy9F7rZAz\n8p1m1dTvg4A=\n-----END PRIVATE KEY-----";
var publicKeyData = "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAO7nb8stPbpOIzpRyanSd2eqD27IibUF\nCgv82fMMXzywUcO1A2L9AZCNUyfdvJPR/Coy9tkryKNvzStciXMuoC8CAwEAAQ==\n-----END PUBLIC KEY-----";

var privateKey = new NodeRSA(privateKeyData);
var publicKey = new NodeRSA(publicKeyData);

module.exports.privateKey = privateKey;
module.exports.publicKey = publicKey;