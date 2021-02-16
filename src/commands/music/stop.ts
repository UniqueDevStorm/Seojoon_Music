import {Command} from "discord-akairo";
import SystemClient from "../../client";

export default class extends Command {
    constructor() {
        super('stop', {
            aliases: ['stop']
        });
    }
    async exec(message) {
        if (!message.guild) return;
        if (!message.member?.voice?.channel) return message.reply('음성통화방에 참가후 다시 시도해주세요.')
        const player = (this.client as SystemClient).manager.players.get(message.guild.id)
        player.destroy()
        await message.reply('정상적으로 대기열을 초기화 하고 음악을 정지하였습니다!')
    }
}