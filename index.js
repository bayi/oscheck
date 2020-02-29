"use strict"
const os          = require('os')
const disk        = require('check-disk-space')
const mqtt        = require('mqtt')
const machineId   = require('node-machine-id')

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
const hostname          = `host${capitalize(os.hostname())}`
const timeIntervalSec   = 10
const rootTopic = `homeassistant/sensor/${hostname}`
const topics = {
    state: `${rootTopic}/state`,
    config: `${rootTopic}/config`
}

console.log(`* Starting oscheck for: ${hostname}`)
console.log('* Connecting to MQTT broker ...')
process.on('exit', () => console.log('! Exiting ...') )

const client = mqtt.connect('mqtt://mqtt.bayi.hu', {
    will: {
        topic: topics.state,
        payload: '{"status": "offline"}',
        qos: 2,
        retain: true
    }
})

client.subscribe(topics.config)
client.on('connect', () => {
    console.log('* Connected.')
    client.publish(topics.config, JSON.stringify({
        name: hostname,
        icon: 'mdi:server',
        json_attributes: [ 'status', 'diskpercent', 'diskfree', 'uptime', 'mempercent', 'memfree' ],
        value_template: '{{ value_json.status }}',
        unique_id: machineId.machineIdSync(),
    }), { retain: true })
})

function getStatus()
{
    return new Promise(resolve => {
        const info = {
            status: 'online',
            disk: 0,
            loadavg: 0,
            uptime: os.uptime(),
            memory: parseFloat(((os.freemem() / os.totalmem()) * 100).toFixed(2))
        }

        const loadAvg = os.loadavg()
        if (loadAvg && loadAvg.length && loadAvg[0])
            info.load = loadAvg[0]

        disk('/').then(diskSpace => {
            if (diskSpace && diskSpace.size)
                info.disk = parseFloat((diskSpace.free / diskSpace.size * 100).toFixed(2))
            resolve(info)
        })
    })
}

const publish = () => getStatus().then(info => {
    client.publish(topics.state, JSON.stringify(info), { retain: false })
})

publish()
setInterval(publish, timeIntervalSec * 1000)
