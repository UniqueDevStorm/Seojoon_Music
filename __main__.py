from discord.ext import commands
from dotenv import load_dotenv
load_dotenv(verbose=True)
import os
TOKEN = os.getenv('TOKEN')

class Bot(commands.AutoShardedBot):
    def __init__(self):
        super().__init__(command_prefix='../')

    async def on_ready(self):
        print(f'{str(self.user)} on Ready.')


bot = Bot()
bot.run(TOKEN)