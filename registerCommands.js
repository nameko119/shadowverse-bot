const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = "1482222623554535464";

const commands = [

new SlashCommandBuilder()
.setName("adddeck")
.setDescription("デッキを登録")
.addStringOption(option =>
    option.setName("name")
    .setDescription("デッキ名")
    .setRequired(true)
),

new SlashCommandBuilder()
.setName("record")
.setDescription("試合結果を記録")

.addStringOption(option =>
    option.setName("mydeck")
    .setDescription("自分デッキ")
    .setRequired(true)
    .setAutocomplete(true)
)

.addStringOption(option =>
    option.setName("enemydeck")
    .setDescription("相手デッキ")
    .setRequired(true)
    .setAutocomplete(true)
)

.addStringOption(option =>
    option.setName("first")
    .setDescription("先攻後攻")
    .setRequired(true)
    .addChoices(
        { name: "先攻", value: "先攻" },
        { name: "後攻", value: "後攻" }
    )
)

.addStringOption(option =>
    option.setName("result")
    .setDescription("勝敗")
    .setRequired(true)
    .addChoices(
        { name: "勝", value: "勝" },
        { name: "負", value: "負" }
    )
),

new SlashCommandBuilder()
.setName("removedeck")
.setDescription("デッキを削除")
.addStringOption(option =>
    option.setName("deck")
    .setDescription("削除するデッキ")
    .setRequired(true)
    .setAutocomplete(true)
)

].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {

  try {

    console.log("コマンド登録中...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID,"1482215063489216645"),
      { body: commands },
    );

    console.log("コマンド登録完了");

  } catch (error) {
    console.error(error);
  }

})();