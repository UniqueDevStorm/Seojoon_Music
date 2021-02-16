import {Command} from "discord-akairo";
import SystemClient from "../../client";

export default class extends Command {
    constructor() {
        super('seek', {
            aliases: ['seek'],
            args: [
                {
                    id: 's',
                    type: 'integer',
                    prompt: {
                        start: '스킵하실 초를 입력해주세요.',
                        retry: '스킵하실 초를 입력해주세요.'
                    },
                }
            ]
        });
    }
    async exec(message, {s}: {s: number}) {
        if (!message.guild) return;
        if (!message.member?.voice?.channel) return message.reply('음성 통화방에 참가후 다시 시도해주세요.')
        const player = (this.client as SystemClient).manager.players.get(message.guild.id)
        player.seek(s * 1000)
        await message.reply(`${s} 초로 이동 완료.`)
    }
}