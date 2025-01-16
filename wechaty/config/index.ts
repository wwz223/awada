const path = require("path");
const fs = require("fs");
import { FileUtils, TypeUtils } from "@/utils";

export const WechatyuiPath =
  "/" + path.join(__dirname, "../database/wechatyui");
export const FilesPath = "/" + path.join(__dirname, "../database/files");
export const CachePath = "/" + path.join(__dirname, "../database/cache");
export const ConfigPath = "/" + path.join(__dirname, "./");

export let staticConfig: TypeUtils.StaticConfigType = null;

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
    callAgent: "http://127.0.0.1:7777/dm",
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
};
