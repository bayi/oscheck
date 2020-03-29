# MQTT Host checker

This small program can be installed on remote server to watch the uptime/cpu activity/ram on the host and then create - from Home Assistant for example - automated alerts based on the values. The MQTT Topics and format used is compatible with HomeAssistants but can be used by other MQTT clients as well.

# Installing
Pull this repository, then do a `yarn install` in the folder. By default the program excepts itself to be placed in a folder called oscheck in your users home directory.

After the dependencies are installed, install the systemd unit file either in to the users local unit files or globally. The unit file has a parameter which defines the user from where the program is running.
Modify the unit file if the paths are different.

# Configuring
The following environment variables can be used to customize:
 - HOSTNAME: use to override the hostname which is automatically detected
 - UID: use to define an UID by yourself, if you want to run multiple instances on similar hosts this is needed so the topics are unique
 - MQTT_SERVER: use to override / define the mqtt broker where the information should be sent
 - MQTT_TOPIC: set base topic for the sensordata