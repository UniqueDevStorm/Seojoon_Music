import {Command} from "discord-akairo";
import SystemClient from "../../client";

export default class extends Command {
    constructor() {
        super('pause', {
            aliases: ['pause', '일시정지']
        });
    }
    async exec(message) {
        if (!message.guild) return;
        if (!message.member?.voice?.channel) return message.reply('음성통화방에 참가후 다시 시도해주세요.')
        const player = (this.client as SystemClient).manager.players.get(message.guild.id)
        if (player.playing) {
            player.pause(true);
            await message.reply('노래를 정지하였습니다!')
        } else {
            player.pause(false)
            await message.reply('노래를 다시 재생하였습니다.')
        }
    }
}