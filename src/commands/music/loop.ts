import {Command} from "discord-akairo";
import SystemClient from "../../client";

export default class extends Command {
    constructor() {
        super('loop', {
            aliases: ['loop', '반복']
        });
    }
    async exec(message) {
        if (!message.guild) return;
        if (!message.member?.voice?.channel) return message.reply('음성통화방에 참가후 다시 시도해주세요.')
        const player = (this.client as SystemClient).manager.players.get(message.guild.id)
        if (!player.trackRepeat) {
            player.setTrackRepeat(true)
            await message.reply('해당 곡을 `반복` 모드로 설정하였습니다.')
        } else {
            player.setTrackRepeat(false)
            await message.reply('해당 곡을 `반복X` 모드로 설정하였습니다.')
        }
    }
}