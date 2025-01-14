let dotenv = require("dotenv");
let Koa = require("koa");
const Router = require("koa-router"); // 导入处理路由的模块
const bodyParser = require("koa-bodyparser"); // 导入处理post请求参数的模块
import { WechatyBuilder, log } from "@juzi/wechaty";
import { FileBox } from "file-box";
import { onScan } from "../service/bot/scan";
import { onLogin } from "../service/bot/login"; // 当机器人需要扫码登陆的时候会触发这个事件。
import { onLogout } from "../service/bot/logout"; // 当机器人检测到登出的时候，会触发事件，并会在事件中传递机器人的信息。
import { onRoomJoin } from "../service/bot/room-join";
import { onRoomLeave } from "../service/bot/room-leave";
import { onFriendShip } from "../service/bot/friendship"; // 当有人给机器人发好友请求的时候会触发这个事件。
import { onError } from "../service/bot/error"; // 当机器人内部出错的时候会触发error 事件。
import CONFIG from "../config";
import { onMessage } from "../service/bot/message"; // 当机器人收到消息的时候会触发这个事件。
import { getContact } from "@/utils/service";
import PB from "@/utils/pb";

dotenv.config("./env");

const app = new Koa();
const router = new Router(); // 创建路由对象

app.use(bodyParser()); // 注册处理post请求参数的中间件

const port = 8088;

/** 机器人初始化 */
export const bot = WechatyBuilder.build({
  name: CONFIG.name,
  puppet: CONFIG.juziPuppetName,
  puppetOptions: {
    tls: {
      disable: true,
    },
    token: process.env?.TOKEN,
    timeoutSeconds: 4 * 60, // 默认1分钟
  },
});

bot.on("scan", onScan);
bot.on("login", onLogin);
bot.on("logout", onLogout);
bot.on("message", onMessage(bot));
bot.on("room-join", onRoomJoin);
bot.on("room-leave", onRoomLeave);
bot.on("friendship", onFriendShip);
bot.on("error", onError);

const start = async () => {
  await PB.login();
  bot
    .start()
    .then(() => log.info("StarterBot", "Starter Bot Started."))
    .catch((e) => log.error("StarterBot", e));
};

start();

router.get("/api/userinfo", (ctx, next) => {
  let request = ctx.request;
  console.log(request.query); // 获取转换成对象之后的 get 请求参数
  console.log("获取当前账号");
  const userId = bot?.currentUser?.id || null;
  ctx.body = { userId: userId };
});

/**
 * @param wxid string
 * @param content string：发送消息内容（如果是群聊组消息并需要发送艾特时，此content字段中需要有对应数量的@[自定义被艾特人的昵称，不得少于2个字符] [每个艾特后都需要一个空格以进行分隔（包括最后一个艾特！）]，这一点很重要！ 如果您不理解，请继续看下面的Tips！）
 * @param atlist array<string>：如果是群聊组消息并需要发送艾特时，此字段是一个被艾特人的数组
 * @description Tips：如果是群聊艾特消息，那么content字段中的@艾特符号数量需要和atlist中的被艾特人数组长度一致，简单来说，就是atlist中有多少个被艾特人的wxid，那么content字段中就需要有多少个艾特组合，位置随意，例如： {"wxid": "xx@chatroom", "content": "这里@11 只是@22 想告诉你@33 每个被艾特人的位置并不重要", "atlist": ["wxid_a", "wxid_b", "wxid_c"]} 每个被艾特人在content中 固定为@[至少两个字符的被艾特人名] + 一个空格！ 如果是发送@所有人消息，那么请在atlist字段中仅传入一个notify@all字符串，content字段中仅包含一个@符号规范（最少两字符+一个空格）， 一般建议是@所有人见名知意
 */
router.post("/api/sendtxtmsg", async (ctx, next) => {
  let request = ctx.request;
  const { content, wxid, atlist = [] } = request.body;
  console.log("body", request.body);
  try {
    const contact = await getContact(bot, wxid);
    if (atlist && atlist.length > 0) {
      contact.say(content, ...atlist);
    } else {
      contact.say(content);
    }
  } catch (err) {
    console.log("error", err);
  }

  ctx.body = { code: 200, msg: "success" };
});

// /**
//  * @param wxid string
//  * @param path string：image链接
//  *
//  */
router.post("/api/sendimgmsg", async (ctx, next) => {
  let request = ctx.request;
  const { path, wxid, atlist } = request.body;
  const fileBox = FileBox.fromUrl(path);

  const contact = await getContact(bot, wxid);

  contact.say(fileBox, ...atlist);
  ctx.body = { code: 200, msg: "success" };
});

router.post("/api/sendfilemsg", async (ctx, next) => {
  let request = ctx.request;
  const data = request.body;
  const { path, wxid, atlist } = data;
  const fileBox = FileBox.fromFile(path);
  const contact = await getContact(bot, wxid);
  contact.say(fileBox, ...atlist);
  ctx.body = { code: 200, msg: "success" };
});

// app.post("/api/sendcardmsg", async (req, res) => {

app
  .use(router.routes()) // 启动路由功能
  .use(router.allowedMethods()); // 自动设置响应头

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
