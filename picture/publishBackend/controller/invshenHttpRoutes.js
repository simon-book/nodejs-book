var express = require('express');
var router = express.Router();
var _ = require('lodash');
var autoSchedule = require('./autoSchedule/index.js');
var copyController = require('./copy_invshen/copyController.js');
var copyImgController = require('./copy_invshen/copyImgController.js');
var commonController = require('./copy_invshen/commonController.js');
var checkController = require('./copy_invshen/checkController.js');
var uploadToOssController = require('./copy_invshen/uploadToOssController.js');
var syncDataController = require('./copy_invshen/syncDataController.js');
var syncDataController1 = require('./copy_invshen/syncDataController1.js');

router.post('/query_branch_info', async function(req, res) {
    var result = await copyController.queryBranchInfo();
    res.send(result);
})
router.post('/create_tag_groups', async function(req, res) {
    await copyController.queryBranchInfo();
    await copyController.create_tag_groups();
    res.send(true);
})
router.post('/copy_all_pictures', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_pictures(req.body.tagGroupId, req.body.tagId);
    res.send(true);
})
router.post('/copy_category_pictures', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_category_pictures();
    res.send(true);
})
router.post('/copy_all_tag_models', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_tag_models(req.body.tagGroupId);
    res.send(true);
})
router.post('/complete_all_model_info', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.complete_all_model_info();
    res.send(true);
})
router.post('/complete_all_model_othername', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.complete_all_model_othername();
    res.send(true);
})
router.post('/copy_articles', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_articles();
    res.send(true);
})
router.post('/create_article', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.create_article(req.body.originId);
    res.send(true);
})
router.post('/copy_all_model_ranks', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_all_model_ranks();
    res.send(true);
})
router.post('/copy_rank_models', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.copy_rank_models(req.body.originId);
    res.send(true);
})
router.post('/check_all_models', async function(req, res) {
    await copyController.queryBranchInfo();
    copyController.check_all_models();
    res.send(true);
})
router.post('/trigger_invshen_scheduele', async function(req, res) {
    autoSchedule.trigger_invshen_scheduele();
    res.send(true);
})
router.post('/check_one_models', async function(req, res) {
    checkController.check_one_models(req.body.originId);
    res.send(true);
})
router.post('/check_all_models_by_max', async function(req, res) {
    checkController.check_all_models(req.body.originId);
    res.send(true);
})
router.post('/check_one_pictures', async function(req, res) {
    checkController.check_one_pictures(req.body.originId);
    res.send(true);
})
router.post('/check_all_pictures_by_max', async function(req, res) {
    checkController.check_all_pictures(req.body.originId);
    res.send(true);
})

if (__G__.copySrc == "fnvshen") autoSchedule.auto_schedule_invshen();

router.post('/copy_articles_img', async function(req, res) {
    copyImgController.copy_articles_img(req.body.articleId, req.body.startIndex);
    res.send(true);
})

router.post('/copy_models_img', async function(req, res) {
    copyImgController.copy_models_img(req.body.modelId, req.body.startIndex);
    res.send(true);
})

router.post('/copy_gallerys_img', async function(req, res) {
    copyImgController.copy_gallerys_img(req.body.pictureId, req.body.startIndex);
    res.send(true);
})

router.post('/update_gallery_img', async function(req, res) {
    uploadToOssController.update_gallery_img(req.body.pictureId);
    res.send(true);
})


router.post('/send_local_data', async function(req, res) {
    var body = req.body;
    var result = await syncDataController.send_local_data({
        copySrc: body.copySrc,
        receiveHost: body.receiveHost,
        receivePort: body.receivePort,
        copyBranchInfo: body.copyBranchInfo,
        copyArticle: body.copyArticle,
        copyModel: body.copyModel,
        copyPicture: body.copyPicture,
        startDate: body.startDate
    });
    res.send(result);
})

router.post('/receive_local_data', syncDataController.receive_local_data)
router.post('/get_local_data', syncDataController1.get_local_data)
router.post('/get_remote_oss_data', async function(req, res) {
    var body = req.body;
    var result = await syncDataController1.get_remote_oss_data({
        copySrc: body.copySrc,
        getHost: body.getHost,
        getPort: body.getPort,
        // copyBranchInfo: body.copyBranchInfo,
        copyArticle: body.copyArticle,
        copyModel: body.copyModel,
        copyPicture: body.copyPicture,
        startDate: body.startDate
    });
    res.send(result);
})

module.exports = router;