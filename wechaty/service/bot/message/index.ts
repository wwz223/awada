import { Message, Wechaty } from "@juzi/wechaty";
import { WechatyUi, BotUtils, FormatUtils } from "@/utils";
import { isUseFulMessage } from "./filter";
import { getMSG } from "./msg";
import { log } from "./log";
import personMessage from "./person";
import config from "@/config";
import Plan from "./plan";

const { directorOrders } = config;

// 消息监听回调
export const onMessage = (bot: Wechaty) => {
  return async (msg: Message) => {
    console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 -【新消息】- 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀");

    /** 读取消息信息 */
    const MSG = await getMSG(msg, bot);

    const { talker, isDirectors, room, text, staticConfig } = MSG;
    const { room_question } = staticConfig;

    /** 日志 */
    log(MSG);

    /* 过滤掉不需要处理的消息 & 无权限消息处理*/
    const isUseFul = await isUseFulMessage(MSG, msg);
    if (!isUseFul) return;

    /** 群消息 */
    if (room) {
      console.log("🌰🌰🌰 群聊消息 🌰🌰🌰");

      /** 导演消息 */
      if (isDirectors) {
        const command = FormatUtils.checkCommand(text);

        /** 消息指令处理 */

        /** 把房间里的所有人提升为导演角色 */
        if (command === directorOrders.co_director) {
          await WechatyUi.promoteRoomDirectors(room);
          return;
        }

        /** start 初始化群、生成json 配置文件 */
        if (command === directorOrders.start) {
          await WechatyUi.initRoomBot(room);
          return;
        }

        /** 查看bot列表 */
        if (command === directorOrders.bot_list) {
          const { configFileMap } = WechatyUi.loadBotsConfig();
          const botList = Object.keys(configFileMap)
            .map((botId) => `Bot ID: ${botId}`)
            .join("\n");
          await room.say(botList);
        }

        /** 刷新群成员 */
        if (command === directorOrders.refresh) {
          await WechatyUi.refreshRoom(room);
          return;
        }

        /** 停止群bot服务 */
        if (command === directorOrders.stop) {
          await WechatyUi.stopRoomBot(room);
          return;
        }

        /** 群内问答 */
        if (room_question === "open") {
          Plan(MSG, msg);
          // SmartQa(MSG, msg)
          return;
        } else {
          room.say(staticConfig.room_speech.no_talking);
        }
      } else {
        /** 群内问答 */
        if (room_question === "open") {
          Plan(MSG, msg);
          // SmartQa(MSG, msg)
          return;
        } else {
          room.say(staticConfig.room_speech.no_talking);
        }
      }
    } else {
      /** 私发消息 */
      personMessage(MSG, msg);
    }
  };
};
