"use strict"

var os          = require('os')
var disk        = require('diskusage')
var mqtt        = require('mqtt')
var machineId   = require('node-machine-id')
var hostname    = `host${capitalize(os.hostname())}`

const root = `homeassistant/sensor/${hostname}`
const state = `${root}/state`
const config = `${root}/config`
const configObj = {
    name: hostname,
    icon: 'mdi:laptop',
    json_attributes: [ 'status', 'diskpercent', 'diskfree', 'uptime', 'mempercent', 'memfree' ],
    value_template: '{{ value_json.status }}',
    unique_id: machineId.machineIdSync(),
}

process.on('exit', () => {
    console.log('Kilepes ...')
})

function capitalize(str)
{
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function abort(str)
{
    console.error(str)
    process.exit(1)
}

console.log('Csatlakozas a brokerhez ...')
const mqttOptions = {}
mqttOptions.will = {
    topic: state,
    payload: '{"status": "offline"}',
    qos: 2,
    retain: true
}

const client = mqtt.connect('mqtt://mqtt.bayi.hu', mqttOptions)
client.subscribe(config)

client.on('connect', () => {
    console.log('Csatlakozva.')
    client.publish(config, JSON.stringify(configObj), { retain: true })
})


function getStatus()
{
    return new Promise(resolve => {
        const info = {
            status: "online",
            disktotal: 0,
            diskfree: 0,
            diskpercent: 0.00,
            loadavg: os.loadavg(),
            uptime: os.uptime(),
            memtotal: parseFloat(os.totalmem()),
            memfree: parseFloat(os.freemem()),
            mempercent: parseFloat(((os.freemem() / os.totalmem()) * 100).toFixed(2))
        }
        disk.check('/', (err, diskinfo) => {
            info.disktotal = diskinfo.total
            info.diskfree = diskinfo.free
            info.diskpercent = parseFloat(((diskinfo.free / diskinfo.total) * 100).toFixed(2))
            resolve(info)
        })
    })
}

function publish()
{
    getStatus().then(info => {
        client.publish(state, JSON.stringify(info), { retain: true })
    })
}

publish()
setInterval(publish, 5 * 1000)
