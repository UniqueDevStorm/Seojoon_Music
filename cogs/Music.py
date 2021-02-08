from discord.ext import commands
from discord.ext.commands.bot import AutoShardedBot
from discord.ext.commands.context import Context
import discord

import re
import lavalink
from dotenv import load_dotenv
import os
import time

load_dotenv(verbose=True)
BOTID = int(os.getenv('BOTID'))
url_rx = re.compile(r'https?://(?:www\.)?.+')

class Music(commands.Cog):
    def __init__(self, bot: AutoShardedBot):
        self.bot = bot
        if not hasattr(bot, 'lavalink'):  # This ensures the client isn't overwritten during cog reloads.
            bot.lavalink = lavalink.Client(BOTID)
            bot.lavalink.add_node('127.0.0.1', 2333, 'youshallnotpass', 'eu')  # Host, Port, Password, Region, Name
            bot.add_listener(bot.lavalink.voice_update_handler, 'on_socket_response')
        bot.lavalink.add_event_hook(self.track_hook)

    def cog_unload(self):
        self.bot.lavalink._event_hooks.clear()

    async def ensure_voice(self, ctx: Context):
        player = self.bot.lavalink.player_manager.create(ctx.guild.id, endpoint=str(ctx.guild.region))
        should_connect = ctx.command.name in ('play',)

        if not ctx.author.voice or not ctx.author.voice.channel:
            raise commands.CommandInvokeError('보이스채널에 연결되어있지 않습니다! 보이스채널에 들어가신후 저를 불러주세요!')

        if not player.is_connected:
            if not should_connect:
                raise commands.CommandInvokeError('보이스채널에 연결되어있지 않습니다! 보이스채널에 들어가신후 저를 불러주세요!')

            permissions = ctx.author.voice.channel.permissions_for(ctx.me)

            if not permissions.connect or not permissions.speak:
                raise commands.CommandInvokeError(f'{ctx.bot.mention} 에게 보이스 연결, 말하기 권한이 있어야해요!')

            player.store('channel', ctx.channel.id)
            await ctx.guild.change_voice_state(channel=ctx.author.voice.channel)
        else:
            if int(player.channel_id) != ctx.author.voice.channel.id:
                raise commands.CommandInvokeError(f'{str(ctx.author)} 님은 제가 있는 보이스채널에 들어와주세요!')

    async def cog_before_invoke(self, ctx):
        guild_check = ctx.guild is not None
        if guild_check:
            await self.ensure_voice(ctx)
        return guild_check

    async def track_hook(self, event):
        if isinstance(event, lavalink.events.QueueEndEvent):
            guild_id = int(event.player.guild_id)
            await self.connect_to(guild_id, None)

    async def connect_to(self, guild_id: int, channel_id: str):
        ws = self.bot._connection._get_websocket(guild_id)
        await ws.voice_state(str(guild_id), channel_id)

    @commands.command(aliases=['p'])
    async def play(self, ctx: Context, *, query: str):
        player = self.bot.lavalink.player_manager.get(ctx.guild.id)
        query = query.strip('<>')
        if not url_rx.match(query):
            query = f'ytsearch:{query}'

        results = await player.node.get_tracks(query)

        if not results or not results['tracks']:
            return await ctx.reply('곡을 찾을수 없습니다.')

        embed = discord.Embed(color=discord.Color.blurple())

        if results['loadType'] == 'PLAYLIST_LOADED':
            tracks = results['tracks']

            for track in tracks:
                player.add(requester=ctx.author.id, track=track)

            embed.title = '플레이리스트 적용 완료!'
            embed.add_field(
                name='타이틀',
                value=f'{results["playlistInfo"]["name"]} - {len(tracks)} tracks'
            )
            embed.set_image(url=f'https://i.ytimg.com/vi/{tracks["info"]["identifier"]}/hqdefault.jpg')
            embed.add_field(
                name='시간',
                value=lavalink.utils.format_time(tracks['info']['length']),
                inline=False
            )
        else:
            track = results['tracks'][0]
            embed.title = '플레이리스트 추가 완료!'
            embed.add_field(
                name='타이틀',
                value=f'[{track["info"]["title"]}]({track["info"]["uri"]})'
            )
            embed.set_image(url=f'https://i.ytimg.com/vi/{track["info"]["identifier"]}/hqdefault.jpg')
            embed.add_field(
                name='시간',
                value=lavalink.utils.format_time(track['info']['length']),
                inline=False
            )

            track = lavalink.models.AudioTrack(track, ctx.author.id)
            player.add(requester=ctx.author.id, track=track)

        await ctx.reply(embed=embed)

        if not player.is_playing:
            await player.play()


def setup(bot: AutoShardedBot):
    bot.add_cog(Music(bot))