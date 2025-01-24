const path = require("path");
import { TypeUtils } from "@/utils";

export const WechatyuiPath =
  "/" + path.join(__dirname, "../database/wechatyui");
export const FilesPath = "/" + path.join(__dirname, "../database/files");
export const CachePath = "/" + path.join(__dirname, "../database/cache");
export const ConfigPath = "/" + path.join(__dirname, "./");

export let staticConfig: TypeUtils.StaticConfigType = null;

export let MAIN_SERVICE_ENDPOINT = "http://127.0.0.1:8077";

/**
 * 常量信息
 */
export default {
  /** 机器人名称 */
  name: "wechaty-ts-bot",

  puppetName: "wechaty-puppet-service" as const,

  juziPuppetName: "@juzi/wechaty-puppet-service" as const,

  /** 默认导演 */
  defaultDirectorId: "7881301783996424",

  Apis: {
    fileList: "http://127.0.0.1:8000/api/ai/v1/scholar/list",
    fileAdd: "http://127.0.0.1:8000/api/ai/v1/scholar/add",
    fileDelete: "http://127.0.0.1:8000/api/ai/v1/scholar/delete",
    smartQa: "http://127.0.0.1:8000/api/ai/v1/scholar/ask",
    feed: `${MAIN_SERVICE_ENDPOINT}/feed`,
    dm: `${MAIN_SERVICE_ENDPOINT}/dm`,
  } as const,

  directorOrders: {
    add_source_to: "/add_source",
    start: "/start",
    add_service_to: "/add_service",
    stop: "/stop",
    co_director: "/promotion",
    refresh: "/refresh",
    bot_list: "/list",
  },

  speechConfig: {
    /* 群对话文案 */
    room_speech: {
      /* 群欢迎语 */
      welcome: "${variable_config.welcome}",
      /* 群无权限 */
      no_permission: "请管理员先开启本群服务权限：@我并输入start",
      /* 新用户加入 */
      person_join:
        "欢迎加入数字社区！\n\n${variable_config.welcome}\n\n请新成员完成以下操作：\n1. 按群主要求修改群昵称\n2. 添加我为微信好友，以便正常使用服务。\n谢谢！",
      /* 修改群备注名提示 */
      modify_remarks: "请您及时按群主要求设定昵称哦，谢谢配合[玫瑰]",
      /* 执行start */
      start:
        "${variable_config.welcome}\n\n请大家添加我为微信好友，以便正常使用服务[呲牙]。",
      /* 群关闭提示文案 */
      stop: "数字社工助理的服务已关闭，再次开通服务请联系管理员",
      update: "我更新好了，欢迎大家@我进行提问。",
      /* 开启群问答 */
      open_talking: "群内对话服务已开启，请@我进行提问。",
      /* 关闭群问答*/
      stop_talking: "对话服务已关闭，如需再次开启请管理员@我并输入taliking",
      /* 当前群未开启问答模式 */
      no_talking: "群内对话服务未开启，请管理员@我并输入talking开启",
    },
    /* 私聊对话文案 */
    person_speech: {
      /* 私聊欢迎语 */
      welcome:
        "欢迎您为社区情景培训课程贡献训练数据！我们将以对话的方式进行采集，您的个人信息都将被去除，如需开始，请输入：#开始\n业务知识查询， 请直接输入问题喔~[抱抱]",
      /* 无权限 */
      no_permission:
        "您暂未开通使用权限，请联系管理员开通，或咨询微信：baohukeji",
      /* 群权限关闭，用于通知管理员*/
      room_stop: "的服务已关闭，再次开启请在群内@我并输入start",
    },
    /* 通用文案 */
    common_speech: {
      /* 不当言论 */
      bad_words: "请勿发表不当言论",
      /* 指令错误 */
      order_error:
        "未查询到相关指令，您是否想输入以下指令：\n查询文件库的所有文件，输入：list \n更多请输入：help",
      /* 收到文件资源，图片、长文本、文件 */
      file_received: "收到新文档，确定添加到文档库中么？确认请回复：确认",
      /* 资源接收失败 */
      file_received_fail: "文件上传失败，请您再试一次，或联系管理员处理～",
      /* 确定添加文件到中台 */
      file_saved: "收到！文件库更新中，请稍后～",
      /* 文件添加到中台成功 */
      file_saved_success: "文件库更新成功",
      /* 执行 #list 未查找到任何文件 */
      file_list_none: "未查找到任何文件",
      /* 执行 #list 查询文件列表 */
      file_list: "文件库已有文件如下：",
      /* 删除文件提示 */
      file_delete: "如需删除某个文件，请回复文件前的数字序号。",
      /* 正在删除 */
      file_delete_start: "文件正在删除中，请稍后～",
      /* 删除失败 */
      file_delete_failed: "文件删除失败，请联系管理员处理哦～",
      /* 删除失败 */
      file_delete_success: "文件删除成功",
      /* 取消操作 */
      abort: "好的，已取消操作",
      /* help 指令*/
      help: "数字社工助理导演指令：\n1. 查询文件库的所有文件，输入：list\n2. 查询服务范围，输入：help\n3. 如需新增文件，请直接转发文件或者文本内容给数字社工助理",
      /* ding 指令*/
      ding: "dong",
    },
    /* 请求相关文案 */
    request_speech: {
      /* flag=1或flag为0、2但contents为空 */
      ask_noanswer: "未检索到相关信息，请换个问题或联系管理员查证",
      /* flag 为-3*/
      audio_failed: "抱歉，没听清呢，好心人不介意再试一次吧[委屈]",
      /* 其他 */
      error: "服务器开小差了，请联系管理员处理哦～",
      /** 路径错误 */
      path_error: "文件路径有问题，请重新上传或联系管理员处理~",
      /** 稍后重试 */
      retry: "抱歉，请稍后重试",
    },
  },
};
