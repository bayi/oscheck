"use strict"
const config      = require('./config')
const MqttSensor  = require('./sensor')
const os          = require('os')
const osutils     = require('os-utils')
const disk        = require('check-disk-space')

process.on('exit', () => console.log('! Exiting ...') )
console.log(`* Starting oscontrol for: ${config.entityName}`)

/*
const sensorLoad = new MqttSensor(
    'load',
    () => new Promise(resolve => {
        const loadAvg = os.loadavg()
        if (loadAvg && loadAvg.length && loadAvg[0])
            return resolve(`${loadAvg[0]}`)
        return resolve('0')
    }),
    { icon: 'mdi:white-balance-sunny'}
)
*/

/*
const sensorUptime = new MqttSensor(
    'uptime',
    () => new Promise(resolve => resolve(`${os.uptime()}`)),
    { icon: 'mdi:run'}
)
*/

const sensorDisk = new MqttSensor(
    'disk',
    () => new Promise(resolve => {
        disk('/').then(diskSpace => {
            if (diskSpace && diskSpace.size)
                resolve(`${parseFloat((diskSpace.free / diskSpace.size * 100).toFixed(2))}`)
            resolve(`0`)
        })
    }),
    { icon: 'mdi:harddisk',}
)

const sensorMemory = new MqttSensor(
    'memory',
    () => new Promise(resolve => resolve(`${parseFloat(((os.freemem() / os.totalmem()) * 100).toFixed(2))}`)),
    { icon: 'mdi:memory'}
)

const sensorCpu = new MqttSensor(
    'cpu',
    () => new Promise(resolve => {
        osutils.cpuUsage(usage => {
            return resolve(`${parseFloat(usage * 100).toFixed(2)}`)
        })
    }),
    { icon: 'mdi:chip'}
)

const update = () => new Promise(resolve => {
    // sensorLoad.update()
    // sensorUptime.update()
    sensorDisk.update()
    sensorMemory.update()
    sensorCpu.update()
    return resolve()
})

update()
setInterval(update, config.timeIntervalSec * 1000)