const { Client, GatewayIntentBits } = require("discord.js");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const creds = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const SHEET_ID = "10b8bHudTvUqIpC3igIEX-86xZg7OFzaq7Tqi9wpRJfI";

async function getDoc() {

  const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

  await doc.loadInfo();

  return doc;

}

// デッキ一覧取得
async function getDecks() {

  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["decks"];

  const rows = await sheet.getRows();

  return rows.map(r => r.get("デッキ"));

}

// デッキ登録
async function addDeck(deckName) {

  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["decks"];

  await sheet.addRow({
    デッキ: deckName
  });

}

// デッキ削除
async function removeDeck(deckName) {

  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["decks"];

  const rows = await sheet.getRows();

  for (const row of rows) {

    if (row.get("デッキ") === deckName) {
      await row.delete();
      break;
    }

  }

}

// 試合結果登録
async function addMatch(user, mydeck, enemydeck, first, result) {

  const doc = await getDoc();
  const sheet = doc.sheetsByTitle["matches"];

  await sheet.addRow({
    日時: new Date().toLocaleString(),
    ユーザー: user,
    自分デッキ: mydeck,
    相手デッキ: enemydeck,
    先攻後攻: first,
    勝敗: result
  });

}

client.on("interactionCreate", async interaction => {

  // オートコンプリート
  if (interaction.isAutocomplete()) {

    const focused = interaction.options.getFocused();
    const decks = await getDecks();

    const filtered = decks
      .filter(d => d.startsWith(focused))
      .slice(0, 25);

    await interaction.respond(
      filtered.map(d => ({ name: d, value: d }))
    );

    return;

  }

  if (!interaction.isChatInputCommand()) return;

  await interaction.deferReply();

  // デッキ登録
  if (interaction.commandName === "adddeck") {

    const deck = interaction.options.getString("name");

    await addDeck(deck);

    await interaction.editReply(`デッキ登録しました: ${deck}`);

  }

  // デッキ削除
  if (interaction.commandName === "removedeck") {

    const deck = interaction.options.getString("deck");

    await removeDeck(deck);

    await interaction.editReply(`デッキ削除しました: ${deck}`);

  }

  // 戦績登録
  if (interaction.commandName === "record") {

    const mydeck = interaction.options.getString("mydeck");
    const enemydeck = interaction.options.getString("enemydeck");
    const first = interaction.options.getString("first");
    const result = interaction.options.getString("result");

    await addMatch(
      interaction.user.username,
      mydeck,
      enemydeck,
      first,
      result
    );

    await interaction.editReply("戦績を記録しました！");

  }

});

client.once("clientReady", () => {

  console.log("Bot起動");

});

client.login(process.env.BOT_TOKEN);