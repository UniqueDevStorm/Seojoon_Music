import {Command} from "discord-akairo";
import SystemClient from "../../client";

export default class extends Command {
    constructor() {
        super('shuffle', {
            aliases: ['shuffle', '셔플']
        });
    }
    async exec(message) {
        if (!message.guild) return;
        if (!message.member?.voice?.channel) return message.reply('음성통화방에 참가후 다시 시도해주세요.')
        const player = (this.client as SystemClient).manager.players.get(message.guild.id)
        if (!player) return message.reply('재생중인 노래가 없네요')
        if (!player.queue.current) return message.reply('재생중인 노래가 없네요')
        player.queue.shuffle()
        await message.reply('현재 있는 대기열들을 셔플 하였습니다.')
    }
}