"use strict"

const os                    = require('os')
const machineId             = require('node-machine-id')
const hostName              = process.env.HOSTNAME || os.hostname()
const entityName            = `host-${hostName}`
const baseTopic             = process.env.MQTT_TOPIC || 'homeassistant/sensor' 

module.exports = {
    mqttHost: process.env.MQTT_SERVER || 'mqtt://10.4.1.212',
    entityName: entityName,
    rootTopic: `${baseTopic}/${entityName}`,
    uniqueId: `${machineId.machineIdSync()}${process.env.UID ? '-' + process.env.UID : ''}`,
    timeIntervalSec: 10
}
