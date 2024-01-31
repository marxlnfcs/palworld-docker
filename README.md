<p align="center" style="font-size: 40px;">PalWorld Dedicated Server - Dockerized</p>

<p align="center">Advanced Dockerized <b>PalWorld Dedicated Server</b> Image</p>

<p align="center">
    <a href="https://github.com/marxlnfcs/palworld-docker/actions/workflows/docker-release.yml" target="_blank"><img src="https://github.com/marxlnfcs/palworld-docker/actions/workflows/docker-release.yml/badge.svg" alt="Build Docker Image"/></a>
    <a href="https://hub.docker.com/repository/docker/marxlnfcs/palworld-dedicated-server" target="_blank"><img src="https://img.shields.io/docker/pulls/marxlnfcs/palworld-dedicated-server" alt="DockerHub Pulls"/></a>
    <a href="https://hub.docker.com/repository/docker/marxlnfcs/palworld-dedicated-server" target="_blank"><img src="https://img.shields.io/docker/stars/marxlnfcs/palworld-dedicated-server" alt="DockerHub Stars"/></a>
    <a href="https://hub.docker.com/repository/docker/marxlnfcs/palworld-dedicated-server" target="_blank"><img src="https://img.shields.io/docker/image-size/marxlnfcs/palworld-dedicated-server/latest" alt="Image Size"/></a>
</p>

![palworld-docker](https://raw.githubusercontent.com/marxlnfcs/palworld-docker/main/preview.png "PalWorld")

## Using Image

---

### Docker / ContainerD / Podman
```
# Default Image
marxlnfcs/palworld-dedicated-server:latest
```

### Kubernetes
If you want to deploy a Palworld dedicated server on Kubernetes, please visit <a href="https://github.com/marxlnfcs/palworld-helm" target="_blank">marxlnfcs/palworld-helm</a>

## Configuration

---
To configure the image you can use some common environment variables or mount a simple configuration file into the container.

Prioritization order of configuration options
- /data/config/PalWorldSettings.ini
- ENV

### Environment Variables

---

#### PW_START_MODE
The start mode is a special variable where you can do different actions like install server and start container without updating it all the time.

| Mode | Description                                                                                                                                      |
|------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| 0    | INSTALL and START server - ``Install the server only if this has not been done yet.``                                                            |
| 1    | INSTALL server and STOP container - ``Install the server only if this has not been done yet.``                                                   |
| 2    | INSTALL server, create config and STOP - ``Install the server only if this has not been done yet.``                                              |
| 3    | UPDATE and START server - ``If the server is not installed, it will be installed automatically.``                                                |
| 4    | UPDATE server and STOP container - ``If the server is not installed, it will be installed automatically.``                                       |
| 5    | UPDATE server, create config and STOP - ``If the server is not installed, it will be installed automatically.``                                  |
| 6    | BACKUP and START server - ``If the server is not installed, the backup task will be skipped. After that, the PW_START_MODE=0 will be executed.`` |
| 7    | BACKUP server and STOP - ``If the server is not installed, the backup task will be skipped.``                                                    | |
|      |                                                                                                                                                  |
| 99   | STARTS container into maintenance/debug mode - ``For debugging only``                                                                            |

---

#### Other Variables
| Variable                 | Description                                                                                                                                     | Default Value                | Allowed Values |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------|----------------|
| PW_DEBUG                 | Write all SteamCMD outputs into stdout/stderr                                                                                                   | false                        | boolean        |
| PW_MAX_PLAYERS           | Maximum amount of players                                                                                                                       | 32                           | 1-32           |
| PW_SERVER_NAME           | Sets the name of the server                                                                                                                     | palworld-dedicated-server    | string         |
| PW_SERVER_DESCRIPTION    | Sets the description of the server                                                                                                              | My Palworld dedicated server | string         |
| PW_SERVER_PASSWORD       | Sets the password that is required to enter when joining the server                                                                             |                              | string         |
| PW_SERVER_ADMIN_PASSWORD | Sets the password that is required to enter to become an admin                                                                                  | Chang3M3!                    | string         |
| PW_PUBLIC_IP             | Public IP-Address, see @PW_COMMUNITY_SERVER                                                                                                     | ``auto-discovered``          | string         |
| PW_PUBLIC_PORT           | Public Port, see @PW_COMMUNITY_SERVER                                                                                                           | ``auto-discovered``          | number         |
| PW_MULTITHREAD_ENABLED   | Starts the Server multi-threaded                                                                                                                | true                         | boolean        |
| PW_COMMUNITY_SERVER      | Starts the server as an Community Server. It will appear in the Community Server list when PW_PUBLIC_IP and PW_PUBLIC_PORT is set and reachable | true                         | boolean        |


---

### Simple Configuration File (``/data/config/PalWorldSettings.ini``)
Due to the somewhat more complex configuration of the default PalWorldSettings.ini, a simpler configuration (key=value) is used, 
which generates the original ``PalWorldSettings.ini`` when the server starts. 
Please note that changes made under ``/data/server/Saved/Config/LinuxServer/PalWorldSettings.ini``will be replaced each time the container is started. 
To configure your server, a ``PalWorldSettings.ini`` in KeyValue format must be created under ``/data/config/PalWorldSettings.ini``.

``Please also note, that environment variables are always overwriting configured values in the config.``

---

#### Example Configuration
``/data/config/PalWorldSettings.ini``
```
Difficulty=None
DayTimeSpeedRate=1.000000
NightTimeSpeedRate=1.000000
ExpRate=1.000000
PalCaptureRate=1.000000
PalSpawnNumRate=1.000000
PalDamageRateAttack=1.000000
PalDamageRateDefense=1.000000
PlayerDamageRateAttack=1.000000
PlayerDamageRateDefense=1.000000
PlayerStomachDecreaceRate=1.000000
PlayerStaminaDecreaceRate=1.000000
PlayerAutoHPRegeneRate=1.000000
PlayerAutoHpRegeneRateInSleep=1.000000
PalStomachDecreaceRate=1.000000
PalStaminaDecreaceRate=1.000000
PalAutoHPRegeneRate=1.000000
PalAutoHpRegeneRateInSleep=1.000000
BuildObjectDamageRate=1.000000
BuildObjectDeteriorationDamageRate=1.000000
CollectionDropRate=1.000000
CollectionObjectHpRate=1.000000
CollectionObjectRespawnSpeedRate=1.000000
EnemyDropItemRate=1.000000
DeathPenalty=All
bEnablePlayerToPlayerDamage=False
bEnableFriendlyFire=False
bEnableInvaderEnemy=True
bActiveUNKO=False
bEnableAimAssistPad=True
bEnableAimAssistKeyboard=False
DropItemMaxNum=3000
DropItemMaxNum_UNKO=100
BaseCampMaxNum=128
BaseCampWorkerMaxNum=15
DropItemAliveMaxHours=1.000000
bAutoResetGuildNoOnlinePlayers=False
AutoResetGuildTimeNoOnlinePlayers=72.000000
GuildPlayerMaxNum=20
PalEggDefaultHatchingTime=72.000000
WorkSpeedRate=1.000000
bIsMultiplay=False
bIsPvP=False
bCanPickupOtherGuildDeathPenaltyDrop=False
bEnableNonLoginPenalty=True
bEnableFastTravel=True
bIsStartLocationSelectByMap=True
bExistPlayerAfterLogout=False
bEnableDefenseOtherGuildPlayer=False
CoopPlayerMaxNum=4
ServerPlayerMaxNum=32
ServerName="Default Palworld Server"
ServerDescription=""
AdminPassword=""
ServerPassword=""
PublicPort=8211
PublicIP=""
RCONEnabled=False
RCONPort=25575
Region=""
bUseAuth=True
BanListURL="https://api.palworldgame.com/api/banlist.txt"
```

## Volumes

---
| Volume                   | Description                                                                             |
|--------------------------|-----------------------------------------------------------------------------------------|
| /data/server             | Stores the server files                                                                 |
| /data/saves              | Stores the SaveGames of the server that are usually stored under /data/server/Pal/Saved |
| /data/backups            | Stores the backup files                                                                 |


## FAQ

---

### I'm seeing alot of S_API errors in the container logs
You can ignore these S_API errors. The server will start as normal

### I've set a SERVER_PASSWORD but when I'm connecting I get a message like "No password entered"
There is an issue with the Palworld. When you try to connect manually with the IP (bottom right corner), there is no password prompt.
If you really need a server password, just start the server as an community server.

## Software used

---

- CM2Network SteamCMD (Officially recommended by Valve - https://developer.valvesoftware.com/wiki/SteamCMD#Docker)
- Palworld Dedicated Server (APP-ID: 2394010 - https://steamdb.info/app/2394010/config/)