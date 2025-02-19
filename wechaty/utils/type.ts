import { Room, Contact } from "@juzi/wechaty";
import { types } from "@juzi/wechaty";

/** 消息类型 */
export const PUPPET_TYPE_MESSAGE = types.Message;

export const MESSAGE_TYPE = {
  文本: PUPPET_TYPE_MESSAGE.Text,
  图片: PUPPET_TYPE_MESSAGE.Image,
  语音: PUPPET_TYPE_MESSAGE.Audio,
  视频: PUPPET_TYPE_MESSAGE.Video,
  文件: PUPPET_TYPE_MESSAGE.Attachment,
  表情符号: PUPPET_TYPE_MESSAGE.Emoticon,
  聊天历史记录: PUPPET_TYPE_MESSAGE.ChatHistory,
  地方: PUPPET_TYPE_MESSAGE.Location,
  小程序: PUPPET_TYPE_MESSAGE.MiniProgram,
  未知: PUPPET_TYPE_MESSAGE.Unknown,
  添加用户成功消息: 18,
  链接: PUPPET_TYPE_MESSAGE.Url,
  撤回消息: PUPPET_TYPE_MESSAGE.Recalled,
};

export type AliasType = Room["alias"];

/** 权限群数据类型 */
export type RoomUsersType = {
  room: Room["payload"];
  users: Contact[] & { roomAlias?: string };
}[];

/** 全局配置 config.json 数据类型 */
export type StaticConfigType = {
      variable_config: {
        bot_name: "Awada Bot";
        welcome: "欢迎使用Awada Bot";
      };
      timeout: 90;
      room_question: "open";
      room_speech: {
        welcome: "${variable_config.welcome}";
        no_permission: "请管理员先开启本群服务权限：@我并输入 start";
        person_join: "${variable_config.welcome}\n\n请新成员完成以下操作：\n1. 按群主要求修改群昵称\n2. 添加我为微信好友，以便正常使用服务。\n谢谢！";
        modify_remarks: "请您及时按群主要求设定昵称哦，谢谢配合[玫瑰]";
        start: "${variable_config.welcome}\n\n请大家添加我为微信好友，以便正常使用服务[呲牙]。";
        stop: "${variable_config.bot_name}的服务已关闭，再次开通服务请联系管理员";
        update: "我更新好了，欢迎大家@我进行提问。";
        open_talking: "群内对话服务已开启，请@我进行提问。";
        stop_talking: "对话服务已关闭，如需再次开启请管理员@我并输入 talking";
        no_talking: "群内对话服务未开启，请管理员@我并输入 talking 开启";
      };
      person_speech: {
        welcome: "${variable_config.welcome}\n\n业务知识查询， 请直接输入问题喔~[抱抱]";
        no_permission: "您暂未开通使用权限，请联系管理员开通，或咨询微信：xxx";
      };
      common_speech: {
        bad_words: "请勿发表不当言论";
        order_error: "未查询到相关指令，您是否想输入以下指令：\n查询文件库的所有文件，输入：list \n更多请输入：help";
        file_received: "收到新文档，确定添加到文档库中么？确认请回复：确认";
        file_received_fail: "文件上传失败，请您再试一次，或联系管理员处理～";
        file_saved: "收到！文件库更新中，请稍后～";
        file_saved_success: "文件库更新成功";
        file_list_none: "未查找到任何文件";
        file_list: "文件库已有文件如下：";
        file_delete: "如需删除某个文件，请回复文件前的数字序号。";
        file_delete_start: "文件正在删除中，请稍后～";
        file_delete_failed: "文件删除失败，请联系管理员处理哦～";
        file_delete_success: "文件删除成功";
        abort: "好的，已取消操作";
        help: "${variable_config.bot_name}导演指令：\n1. 查询文件库的所有文件，输入：list\n2. 查询服务范围，输入：help\n3. 如需新增文件，请直接转发文件或者文本内容给${variable_config.bot_name}";
        ding: "dong";
      };
      request_speech: {
        ask_noanswer: "未检索到相关信息，请换个问题或联系管理员查证";
        audio_failed: "抱歉，没听清呢，好心人不介意再试一次吧[委屈]";
        error: "${variable_config.bot_name}开小差了，请联系管理员处理哦～";
        path_error: "文件路径有问题，请重新上传或联系管理员处理~";
        retry: "抱歉，请稍后重试";
      };
    }
  | undefined;
