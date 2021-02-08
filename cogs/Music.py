from discord.ext import commands
from discord.ext.commands.bot import AutoShardedBot
import lavalink


class Music(commands.Cog):
    def __init__(self, bot: AutoShardedBot):
        self.bot = bot





def setup(bot: AutoShardedBot):
    bot.add_cog(Music(bot))