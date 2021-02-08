from discord.ext import commands
from dotenv import load_dotenv
import os
from utils.autocogs import AutoCogs

load_dotenv(verbose=True)
TOKEN = os.getenv("TOKEN")


class Bot(commands.AutoShardedBot):
    def __init__(self):
        super().__init__(command_prefix="../")
        AutoCogs(self)

    async def on_ready(self):
        print(f"{str(self.user)} on Ready.")


bot = Bot()
bot.run(TOKEN)
