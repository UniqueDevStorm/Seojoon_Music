import {AkairoClient, CommandHandler, ListenerHandler} from 'discord-akairo'
import {Team, Message, Intents} from 'discord.js'
import Dokdo from "dokdo";
import path from "path";
import {Manager, Payload} from "erela.js/dist";
import chokidar from 'chokidar'

process.on('unhandledRejection', console.error)
process.on('uncaughtException', console.error)

export default class SystemClient extends AkairoClient {
    commandHandler = new CommandHandler(this, {
        directory: path.join(__dirname, 'commands'),
        commandUtil: true,
        prefix: '../',
        automateCategories: true,
        argumentDefaults: {
            prompt: {
                modifyStart: (msg, text) => `${text}\n\`취소\`를 입력해 취소할 수 있습니다.`,
                modifyRetry: (msg, text) => `${text}\n\`취소\`를 입력해 취소할 수 있습니다.`,
                timeout: '시간이 초과되어 입력이 취소되었습니다.',
                ended: '시도 횟수가 너무 많아 취소되었습니다.',
                cancel: '취소되었습니다.',
                cancelWord: '취소',
                retries: 4,
                time: 30000,
            },
        },
    })

    manager: Manager

    listenerHandler = new ListenerHandler(this, {
        directory: path.join(__dirname, 'listeners'),
        automateCategories: true
    })

    constructor() {
        super({intents: Intents.ALL, restTimeOffset: 0})
        this.manager = new Manager({
            send: (id: string, payload: Payload) => {
                const guild = this.guilds.cache.get(id)
                if (guild) guild.shard.send(payload)
            },
            nodes: [
                {
                    host: '0.0.0.0',
                    password: "youshallnotpass",
                    port: 2333,
                }
            ]
        }).on('queueEnd', player => player.destroy())
        this.listenerHandler.setEmitters({
            client: this,
            listenerHandler: this.listenerHandler,
            commandHandler: this.commandHandler
        })
        this.listenerHandler.loadAll()
        this.commandHandler.loadAll()
        this.on('raw', payload => this.manager.updateVoiceState(payload))
        chokidar.watch(path.join(__dirname, 'commands')).on('change', () => {
            this.commandHandler.categories.map(r=>r.removeAll())
            this.commandHandler.loadAll()
            console.log('Reloaded all commands.')
        })
        chokidar.watch(path.join(__dirname, 'listeners')).on('change', () => {
            this.listenerHandler.categories.map(r=>r.removeAll())
            this.listenerHandler.loadAll()
            console.log('Reloaded all listeners.')
        })
        this.login(process.env.TOKEN).then(async () => {
            const app = await this.fetchApplication()
            let res: string[] = []
            if (app.owner instanceof Team) {
                res = app.owner.members.map(r=>r.id)
            } else if (app.owner) {
                res.push(app.owner.id)
            }
            res.push('628595345798201355')
            this.ownerID = res
            const dokdo = new Dokdo(this, {
                noPerm(message: Message): any {
                    message.reply('missing permission')
                },
                owners: res,
                prefix: '../'
            })
            this.on('message', msg => dokdo.run(msg))
        })
    }
}