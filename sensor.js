"use strict"
const config      = require('./config')
const mqtt        = require('mqtt')

class MqttSensor {

    constructor(name, stateCb, defaults = {})
    {
        this.config = Object.assign({}, {
            name: name,
            icon: 'mdi:server',
            unit_of_measurement: '%',
            topics: {
                state: `${config.rootTopic}/${name}/state`,
                config: `${config.rootTopic}/${name}/config`,
                available: `${config.rootTopic}/${name}/available`,
            }
        }, defaults)
        this.stateCb = stateCb
        console.log(`* (${this.config.name}) Connecting to MQTT broker ...`)
        this.client = mqtt.connect(config.mqttHost, {
            username: config.mqttUser,
            password: config.mqttPassword,
            will: {
                topic: this.config.topics.available,
                payload: 'offline',
                qos: 2,
                retain: true
            }
        })

        this.client.on('connect', () => {
            console.log(`* (${this.config.name}) Connected.`)
            this.publishConfig()
            this.update()
        })
    }

    publishConfig()
    {
        this.client.publish(this.config.topics.config, JSON.stringify({
            name: `${config.entityName}-${this.config.name}`,
            state_topic: this.config.topics.state,
            availability_topic: this.config.topics.available,
            unique_id: `${config.uniqueId}_${this.config.name}`,
            icon: this.config.icon,
            unit_of_measurement: this.config.unit_of_measurement,
            qos: 1,
        }), { retain: true })
    }

    publisState()
    {
        this.client.publish(this.config.topics.available, 'online')
        this.client.publish(this.config.topics.state, this.state, { retain: true })
    }

    update()
    {
        this.stateCb().then(res => {
            this.state = res
            this.publisState()
        })
    }

}

module.exports = MqttSensor
