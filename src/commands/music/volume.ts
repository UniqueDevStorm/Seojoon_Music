import {Argument, Command} from "discord-akairo";
import SystemClient from "../../client";

export default class extends Command {
    constructor() {
        super('vol', {
            aliases: ['volume', 'v'],
            args: [
                {
                    id: 'v',
                    type: Argument.range('integer', 1, 101),
                    default: null
                }
            ]
        });
    }
    async exec(message, {v}: {v: number}) {
        if (!message.guild) return;
        if (!message.member?.voice?.channel) return message.reply('음성통화방에 참가후 다시 시도해주세요.')
        const player = (this.client as SystemClient).manager.players.get(message.guild.id)
        if (!player) return message.reply('음악이 재생되고 있지 않습니다.')
        if (!v) return await message.reply(`${player.volume}%.`)
        player.setVolume(v)
        return await message.reply(`${v}%로 조정.`)
    }
}