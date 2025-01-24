import { MSGType } from "../msg";
import { Message } from "@juzi/wechaty";
import { MessageUtils, isUrl } from "@/utils";
import { requestDm } from "@/service/algorithm";
import Conversation from "./conversation";
import Config, { FilesPath } from "@/config";
import Plan, { replyMessage, xlsxAction } from "../plan";
import { getMessageFunUser, getMessageFunDirector } from "./message-func";
import { bot } from "@/src/index";

const yesNoDocx = (str) => {
  return str.endsWith(".docx");
};

const yesNoXlsx = (str) => {
  return str.endsWith(".xlsx");
};

/** 私发消息处理 */
export default async (MSG: MSGType, msg: Message) => {
  console.log("🌰🌰🌰 私聊消息 🌰🌰🌰");

  const { type, text, talker, isDirectors, staticConfig } = MSG;
  const { timeout, directors } = staticConfig;
  const {
    config: ConversationConfig,
    resetConfig,
    resetTalkerConfig,
  } = Conversation;
  const talkerId = MSG.talker.id;

  /** 将文件转发给该导演 */
  const defaultDirectorId = Config.defaultDirectorId;

  /** 当前导演对话轮次相关信息 */
  const CurrentUserConfig = ConversationConfig[MSG.talker.id];
  const { status = "无对话轮次", fileName = "" } = CurrentUserConfig || {};

  let duration = 1000;

  /** 是否超时 */
  const overtime = duration > timeout;

  /** 导演消息 */
  if (isDirectors) {
    console.log("🌰🌰🌰 导演消息 🌰🌰🌰");

    const MESSAGE_FUNC = getMessageFunDirector(text, type, status, overtime);
    console.log("MESSAGE_FUNC", MESSAGE_FUNC);
    /** 导演指令 */
    // if (MESSAGE_FUNC === "命令") return command(MSG, msg);

    if (MESSAGE_FUNC === "修改意见输入格式错误") {
      return msg.say("请用文字或者语音输入修改意见！");
    } else if (MESSAGE_FUNC === "修改意见") {
      console.log("文件修改意见", fileName);

      let { success, contents } = await requestDm({
        user_id: MSG.talker.id,
        type: "file",
        content: isUrl(fileName) ? fileName : `${FilesPath}/${fileName}`,
        addition: text,
      });

      if (success) {
        await replyMessage(contents || [], msg, text);
        return resetTalkerConfig(talkerId);
      } else {
        msg.say("修改失败，请重新输入修改意见！");
      }
    }
    if (MESSAGE_FUNC === "语音") {
      resetTalkerConfig(talkerId, {
        status: "无对话轮次",
      });
      return Plan(MSG, msg);
    }

    if (MESSAGE_FUNC === "问题") {
      resetTalkerConfig(talkerId, {
        status: "无对话轮次",
      });
      return Plan(MSG, msg);
    }

    if (MESSAGE_FUNC === "文本链接" || MESSAGE_FUNC === "链接") {
      resetTalkerConfig(talkerId);
      return;
      // let link = "";
      // if (MESSAGE_FUNC === "链接") {
      //   const urlLink = await msg.toUrlLink();
      //   link = urlLink.url();
      // } else {
      //   link = text;
      // }
      // console.log("链接", link);
      // msg.say(staticConfig.common_speech.file_received);
      // console.log("链接保存成功！");
      // resetTalkerConfig(talkerId, {
      //   fileName: link,
      //   status: "是否添加文件",
      // });
    }

    if (
      MESSAGE_FUNC === "长文本消息" ||
      MESSAGE_FUNC === "图片" ||
      MESSAGE_FUNC === "文件"
    ) {
      let fileName = "";
      let isDocx = false;
      let isXlsx = false;
      let file = null;
      if (MESSAGE_FUNC === "长文本消息") {
        return;
        // let title = text;
        // title = title.slice(0, 8).replaceAll(/\s*/g, "").replaceAll("\n", "");
        // fileName = `${title}.txt`;
        // await MessageUtils.saveTxt(text, title);
      } else {
        /** 图片名字获取不到 */
        file = await msg.toFileBox();
        fileName = file.name;
        console.log("fileName", fileName);
        isDocx = yesNoDocx(fileName);
        isXlsx = yesNoXlsx(fileName);
        await MessageUtils.saveImage(file, isXlsx ? "cache" : "files");
      }

      if (fileName) {
        if (isDocx) {
          await msg.say("收到，请输入您的修改意见...");
          resetTalkerConfig(talkerId, {
            fileName,
            status: "输入修改意见",
          });
        } else if (isXlsx) {
          await xlsxAction(MSG, msg, fileName);
          return resetTalkerConfig(talkerId);
        } else {
          resetTalkerConfig(talkerId);
          // msg.say(staticConfig.common_speech.file_received);
          // console.log("文件保存成功！");
          // resetTalkerConfig(talkerId, {
          //   fileName,
          //   status: "是否添加文件",
          // });
        }
      } else {
        msg.say(staticConfig.common_speech.file_received_fail);
        console.log("文件保存本地失败");
      }
    }
  } else {
    console.log("🌰🌰🌰 用户消息 🌰🌰🌰");
    const NORMAL_MESSAGE_FUNC = getMessageFunUser(text, type, status, overtime);

    if (NORMAL_MESSAGE_FUNC === "修改意见输入格式错误") {
      return msg.say("请用文字或者语音输入修改意见！");
    } else if (NORMAL_MESSAGE_FUNC === "修改意见") {
      console.log("文件修改意见", fileName);

      let { success, contents } = await requestDm({
        user_id: MSG.talker.id,
        type: "file",
        content: isUrl(fileName) ? fileName : `${FilesPath}/${fileName}`,
        addition: text,
      });

      if (success) {
        await replyMessage(contents || [], msg, text);
        return resetTalkerConfig(talkerId);
      } else {
        msg.say("修改失败，请重新输入修改意见！");
      }
    }

    if (NORMAL_MESSAGE_FUNC === "未知") {
      return;
    } else if (
      NORMAL_MESSAGE_FUNC === "语音" ||
      NORMAL_MESSAGE_FUNC === "文本"
    ) {
      return Plan(MSG, msg);
    } else {
      // BotUtils.sendMessage()
      const user = await bot.Contact.find({
        id: defaultDirectorId,
      });

      if (
        NORMAL_MESSAGE_FUNC === "文本链接" ||
        NORMAL_MESSAGE_FUNC === "链接"
      ) {
        resetTalkerConfig(talkerId);
        return;
      } else if (NORMAL_MESSAGE_FUNC === "文件") {
        const file = await msg.toFileBox();
        const fileName = file.name;
        const isDocx = yesNoDocx(fileName);
        const isXlsx = yesNoXlsx(fileName);
        await MessageUtils.saveImage(file, isXlsx ? "cache" : "files");
        if (fileName) {
          if (isDocx) {
            await msg.say("收到，请输入您的修改意见...");
            resetTalkerConfig(talkerId, {
              fileName,
              status: "输入修改意见",
            });
          } else if (isXlsx) {
            await xlsxAction(MSG, msg, fileName);
            return resetTalkerConfig(talkerId);
          } else {
            resetTalkerConfig(talkerId);
          }
        } else {
          msg.say(staticConfig.common_speech.file_received_fail);
          console.log("文件保存本地失败");
        }
      }
    }
  }
};
