import chalk from 'chalk'
import { Client, ClientOptions, Intents } from 'discord.js'
import { config } from 'dotenv'

config()

// Mapping below signals to handle about how terminates DiscordJS Client
// with in harmony. In the future, We could add more handlers for this signals.
const signals: ReadonlyArray<NodeJS.Signals> = ['SIGINT', 'SIGHUP']
const signalHandler = (signal: NodeJS.Signals) => {
  // Error code ref: https://m.blog.naver.com/namhong2001/221488905144
  signals.forEach(signal => process.off(signal, signalHandler))

  process.exitCode = 1

  try {

    process.stdout.write('\n\n')
    info(
      `Detected hook: ${chalk.cyan.bold(signal)}\n` + 'Try to destroy...'
    )
    client.destroy()
    process.exitCode = 0
  } catch (error) {
    if (error instanceof Error) {
      if (error.name.includes('ASDF')) process.exitCode = 35
    } else {
      throw new Error(error)
    }
  } finally {
    if (process.exitCode || 0 > 0)
      console.warn(chalk.yellow('Am I terminating up in harmony...?'))

    process.exit()
  }
}

signals.forEach(signal => {
  process.once(signal, signalHandler)
})

// Handle unhandled exceptions or rejection from Promise.
process.on('uncaughtException', err => {
  error('Uncaught exception occured!')
  error(err?.message ?? err)
})

function info(...messages: string[]) {
  console.info(chalk.bold.inverse.blueBright('[INFO]'), ...messages)
}

function warn(...messages: string[]) {
  console.warn(chalk.bold.inverse.yellow('[WARN]'), ...messages)
}

function error(...messages: string[]) {
  console.error(chalk.bold.inverse.red('[ERROR]'), ...messages)
}

const clientOptions: ClientOptions = {
  intents: [
    Intents.ALL
  ],
  partials: ['MESSAGE', 'CHANNEL', 'USER', 'REACTION']
}
const client = new Client(clientOptions)

client.on('ready', () => {
  info('YEAH')
})

client.on('warn', warn)
// @ts-expect-error
client.on('error', error)

client.on('guildMemberAdd', async member => {
  await member.roles.add('625087286031417372')

  info(`Gave a Trainer role to ${member.user.tag}<#${member.user.id}>`)
})

client.on('message', async message => {
  info(message.content)
})

client.on('messageReactionAdd', async (partialReaction, partialUser) => {
  // Ignore if unexpected reaction event
  if (partialReaction.message.id !== '866501673312190524' || partialUser.bot)
    return

  if (partialReaction.emoji.id !== '866515881911910400') {
    await partialReaction.remove()
    return
  }

  const reaction = await partialReaction.fetch()
  const user = await partialUser.fetch()

  // If the bot does not react yet
  if (!reaction.users.cache.findKey(user => user === client.user!)) {
    info(`I Haven't react to the specific message yet so react it.`)
    await reaction.message.react('866515881911910400')
  }

  // Tada
  const guild = client.guilds.cache.get('471737560524390420')
  const member = guild!.members.cache.get(user.id)
  const roles = member!.roles

  // Give "트레이너" role
  if (!roles.cache.has('625087286031417372'))
    await roles.add('625087286031417372')

  // Give "#Accepted" role
  if (!roles.cache.has('764045096777154571'))
    await roles.add('764045096777154571')

  // info(`Removed reaction of member ${user.tag}<#${user.id}>`)
  // await reaction.users.remove(user)
})

void client.login()
