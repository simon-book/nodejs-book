var kafka = require('kafka-node');
var util = require('../util/index.js');

var client = new kafka.KafkaClient({
    kafkaHost: __plat__.kafkaHost
});
var admin = new kafka.Admin(client);
var producer = new kafka.Producer(client);

var Topics = {
    "Test.Chenmeng.Demo": "测试",
    "Event.KjjShop.Order": "订单",
}

var EventTypes = {
    "order.new": "新订单", //for Event.kjjShop.order
    "order.update": "订单更改", //for Event.kjjShop.order
    "order.refund": "退单", //for Event.kjjShop.order
}

function createGroupCosumer(topic, groupName) {
    var options = {
        kafkaHost: __plat__.kafkaHost,
        groupId: groupName,
        autoCommit: true,
        autoCommitIntervalMs: 5000,
        sessionTimeout: 15000,
        fetchMaxBytes: 10 * 1024 * 1024, // 10 MB
        protocol: ['roundrobin'],
        fromOffset: 'latest',
        outOfRangeOffset: 'earliest'
    };
    var consumer = new kafka.ConsumerGroup(options, topic);
    return consumer;
}

function createCosumer(topic, groupName) {
    var consumer = new kafka.Consumer(client, [{
        topic: topic
    }], {
        groupId: groupName
    });
    return consumer;
}

function sendMessage(topic, message, key) {
    if (!(typeof message == "string")) message = JSON.stringify(message);
    var payloads = [{
        topic: topic,
        messages: message,
        key: key || '0'
    }]
    return new Promise(function(resolve, reject) {
        producer.send(payloads, function(err, data) {
            if (err) {
                resolve(err)
            } else resolve(true);
        })
    })

}

function kafkaEvent(eventType, eventData, eventToken, eventCreatedAt) {
    return {
        eventType: eventType,
        data: eventData,
        token: eventToken || util.generateTokenSalt(12),
        createdAt: eventCreatedAt || new Date()
    }
}

module.exports = {
    sendMessage,
    createGroupCosumer,
    createCosumer,
    kafkaEvent
}