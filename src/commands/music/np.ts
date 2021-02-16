import {Command} from "discord-akairo";
import {MessageEmbed} from "discord.js";
import SystemClient from "../../client";

function formatTime(duration: number) {
    const d = new Date(0)
    d.setMilliseconds(duration)
    return d.toISOString().substr(11, 8)
}

function createBar(
    total: number,
    current: number,
    size = 15,
    line = '▬',
    slider = '🔘',
) {
    if (current > total) {
        const bar = line.repeat(size + 2)
        const percentage = (current / total) * 100
        return [bar, percentage]
    } else {
        const percentage = current / total
        const progress = Math.round(size * percentage)
        const emptyProgress = size - progress
        const progressText = line.repeat(progress).replace(/.$/, slider)
        const emptyProgressText = line.repeat(emptyProgress)
        const bar = progressText + emptyProgressText
        const calculated = percentage * 100
        return [bar, calculated]
    }
}

export default class extends Command {
    constructor() {
        super('np', {
            aliases: ['np', 'ㅞ']
        });
    }
    async exec(message) {
        if (!message.guild) return;
        if (!message.member?.voice?.channel) return message.reply('음성통화방에 참가후 다시 시도해주세요.')
        const player = (this.client as SystemClient).manager.players.get(message.guild.id)
        if (!player) return message.reply('재생중인 노래가 없네요')
        if (!player.queue.current) return message.reply('재생중인 노래가 없네요')
        const embed = new MessageEmbed()
        if (!player || !player.queue.current) {
            embed.setTitle('재생중인 곡이 없네요!')
        } else {
            const t = player.queue.current
            embed.setTitle(
                `${player.playing ? ':arrow_forward:' : ':pause_button:'} ${t.title}`,
            )
            embed.setThumbnail(t.displayThumbnail?.('maxresdefault')!)
            embed.setDescription(
                `${formatTime(player.position)} ${
                    createBar(t.duration!, player.position)[0]
                } ${formatTime(t.duration! - player.position)}`,
            )
            embed.addFields([
                {
                    name: '볼륨',
                    value: player.volume + '%',
                    inline: true,
                },
                {
                    name: '반복 모드',
                    value: player.queueRepeat
                        ? '대기열 전체 반복'
                        : player.trackRepeat
                            ? '현재 곡 반복'
                            : '반복 안함',
                    inline: true,
                },
            ])
            embed.setFooter(
                (t.requester as any).tag,
                (t.requester as any).displayAvatarURL({ dynamic: true }),
            )
        }
        await message.reply(embed)
    }
}