import {Command} from "discord-akairo";
import SystemClient from "../../client";

export default class extends Command {
    constructor() {
        super('play', {
            aliases: ['play'],
            args: [
                {
                    id: 'query',
                    type: 'string',
                    prompt: {
                        start: '곡 제목 또는 Url을 입력해주세요',
                        retry: '곡 제목 또는 Url을 입력해주세요',
                    },
                    match: 'rest'
                }
            ]
        });
    }
    async exec(message, {query}: {query: string}) {
        if (!message.guild) return
        if (!message.member?.voice?.channel) return message.reply('음성통화방에 참가후 다시 시도해주세요.')
        const player = (this.client as SystemClient).manager.create({
            guild: message.guild.id,
            textChannel: message.channel.id,
            voiceChannel: message.member.voice.channelID!
        })
        let res = await (this.client as SystemClient).manager.search(query, message.author)
        if (res.loadType === 'NO_MATCHES') {
            return message.reply('검색 결과가 없어요!')
        } else if (res.loadType === 'LOAD_FAILED') {
            return message.reply('로딩 실패: ' + res.exception.message)
        } else if (res.loadType === 'PLAYLIST_LOADED') {
            player.queue.add(res.tracks)
            player.connect()
            await message.reply(`재생목록이 추가되었습니다. (곡 ${res.tracks.length}개)`)
            if (!player.playing) await player.play()
        } else {
            const t = res.tracks[0]
            player.queue.add(t)
            player.connect()
            await message.reply(`곡 \`${t.title}\`을(를) 대기열에 추가했어요!`)
            if (!player.playing) await player.play()
        }
    }
}