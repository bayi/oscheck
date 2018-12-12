"use strict"

var os          = require('os')
var disk        = require('diskusage')
var mqtt        = require('mqtt')

const root = `sysinfo/${os.hostname()}`

process.on('exit', () => {
    console.log('Kilepes ...')
})

function abort(str) {
    console.error(str)
    process.exit(1)
}

console.log('Csatlakozas a brokerhez ...')
const mqttOptions = {}
mqttOptions.will = {
    topic: `${root}/presence`,
    payload: '0',
    qos: 2,
    retain: true
}

const client = mqtt.connect('mqtt://mqtt.bayi.hu', mqttOptions)
client.subscribe(`${root}/presence`)

client.on('connect', () => {
    console.log('Csatlakozva.')
    client.publish(`${root}/presence`, '1', { retain: true })
})


function getStatus()
{
    return new Promise(resolve => {
        const info = {
            disktotal: 0,
            diskfree: 0,
            diskpercent: 0.00,
            loadavg: os.loadavg(),
            uptime: os.uptime(),
            memtotal: os.totalmem(),
            memfree: os.freemem(),
            mempercent: ((os.freemem() / os.totalmem()) * 100).toFixed(2)
        }
        disk.check('/', (err, diskinfo) => {
            info.disktotal = diskinfo.total
            info.diskfree = diskinfo.free
            info.diskpercent = ((diskinfo.free / diskinfo.total) * 100).toFixed(2)
            resolve(info)
        })
    })
}

function publish()
{
    getStatus().then(info => {
        client.publish(`${root}/status`, JSON.stringify(info), { retain: true })
    })
}

publish()
setInterval(publish, 5 * 1000)
