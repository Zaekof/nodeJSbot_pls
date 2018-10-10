/***
* TEAM PLS BOT
* BY ZAËKOF
* CREATED WITH HEART
***/

const Twit = require('twit')
const fetch = require('node-fetch')
const Eris = require('eris')

// Twit module configuration
var T = new Twit({
  consumer_key:         '...',
  consumer_secret:      '...',
  access_token:         '...',
  access_token_secret:  '...'
})

// Global const
const database = {
  "bot": {
    "token": '...',
    "prefix": '!',
    "channel_id": '...',
    "guild_id": '...'
  },
  "twitch": {
    "login": [
      {
        "id": "...",
        "auth": "..."
      }
    ],
    "users": [
      {
        "pseudo": "here_twitch_username",
        "id": "here_twitch_username_id",
        "twitter": "here_twitter_username",
        "statut": false
      }
    ]
  }
}

// Discord instance with Eris module
let bot = new Eris.CommandClient(database.bot.token, {}, {
  description: "...",
  owner: "...",
  prefix: "!"
})

// Get a Twitch id by username
const getUserId = async function () {
  let name = 'here_username_twitch'
  try {
    let response = await fetch(`https://api.twitch.tv/helix/users?login=${name}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-ID': database.twitch.login[0].id,  
        'Authorization':  'Bearer ' + database.twitch.login[0].auth
      }
    })

    if (response.ok) {
      let data = await response.json()
      console.log(data.data[0].id) // id here
    }
  } catch (e) {
    console.log(e)
  }
}

// Get a Twitch channel info
const getStreams = async function (id, cpt) {
  try {
    let response = await fetch(`https://api.twitch.tv/helix/streams?user_id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-ID': database.twitch.login[0].id,  
        'Authorization':  'Bearer ' + database.twitch.login[0].auth
      }
    })
    if (response.ok) {
      let data = await response.json()
      
      if (data.data.length && !database.twitch.users[cpt].statut) {
        database.twitch.users[cpt].statut = true

        let titre_stream = data.data[0].title
        let pseudo_twitch = database.twitch.users[cpt].pseudo
        let pseudo_twitter = database.twitch.users[cpt].twitter

        let twitch_link = ` https://www.twitch.tv/${pseudo_twitch}`
        let discord_str = `Hey! ${pseudo_twitch} est en live (${titre_stream}) 👉 `
        let twitter_str = `Hey! @${pseudo_twitter} est en live (${titre_stream}) 👉  https://www.twitch.tv/${pseudo_twitch}.`

        T.post('statuses/update', { status: twitter_str }, (err, data, response) => {
          if (err) console.log(err)
        })

        // Markdown check
        if (discord_str.search("_") !== -1) {
          discord_str = discord_str.replace(/_/g, "\\\_")
          discord_str = discord_str.concat(" ", twitch_link)
        } else if (discord_str.search("__") !== -1) {
          discord_str = discord_str.replace(/__/g, "\\\__")
          discord_str = discord_str.concat(" ", twitch_link)
        }

        ft_send(discord_str)

      } else if (data.data.length <= 0) {
        database.twitch.users[cpt].statut = false
      }
    }
    
  } catch (e) {
    console.log(e)
  }
}

let ft_interval = function () {
  let cpt = 0

  database.twitch.users.forEach((e) => {
    let data = getStreams(e.id, cpt)
    cpt += 1
  })

  setTimeout(() => {
    ft_interval()
  }, 60000)
}

function ft_send(content) {
  bot.createMessage(database.bot.channel_id, content)
}

bot.on('ready', () => {
  console.log('Ready!')
  ft_interval()
})
bot.connect()
