import fs from "fs";
import JSON5 from "json5";
import { Room, Contact, log } from "@juzi/wechaty";
import { RoomUsersType } from "./type";
import { WechatyuiPath, ConfigPath } from "@/config";
import path from "path";

const configFolderPath = "../../avatars";

/** 获取导演列表 */
export const loadDirectors = () => {
  let directors = [];
  if (fs.existsSync("directors.json")) {
    directors = JSON.parse(fs.readFileSync("directors.json", "utf-8"));
  }
  return directors;
};

/** 获取所有bot 配置文件 */
export const loadBotsConfig = () => {
  const botsList = [];
  const serviceUserList = [];
  const configFileMap = {};
  const learnSourcesMap = {};
  const serviceListMap = {};
  const configFiles = fs
    .readdirSync(configFolderPath)
    .filter((file) => file.endsWith(".json"));
  configFiles.forEach((file) => {
    const configFile = path.join(configFolderPath, file);
    const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
    const botId = config.bot_id || "default";
    botsList.push(botId);
    configFileMap[botId] = configFile;
    config.learn_sources.forEach((source) => (learnSourcesMap[source] = botId));

    serviceUserList.push(...config.service_list);
    config.service_list.forEach((service) => (serviceListMap[service] = botId));
  });
  return {
    botsList,
    serviceUserList,
    configFileMap,
    learnSourcesMap,
    serviceListMap,
  };
};

/** 判断是否为管理员 */
export const isDirectors = async (id: string): Promise<boolean> => {
  const directors = loadDirectors();
  return directors.includes(id);
};

/** 把房间里的所有人提升为导演角色 */
export const promoteRoomDirectors = async (room: Room) => {
  const members = await room.memberAll();
  const directors = loadDirectors();
  const newDirectors = [...directors, ...members];
  const uniqueDirectors = new Set(newDirectors);
  fs.writeFileSync(
    "directors.json",
    JSON.stringify(Array.from(uniqueDirectors), null, 2)
  );
  room.say("已将群内所有人提升为导演");
};

/** 初始化一个群，将该群保存为一个agent，生成配置文件 */
export const initRoomBot = async (room: Room) => {
  const { configFileMap } = loadBotsConfig();
  const roomId = room.id;
  if (configFileMap[roomId]) {
    log.info(`Bot already exists for room ${roomId}`);
    room.say("该群已存在机器人");
    return;
  }

  const config = {
    bot_id: roomId,
    learn_sources: [roomId],
    service_list: [roomId],
  };

  configFileMap[roomId] = path.join(configFolderPath, `${roomId}.json`);
  fs.writeFileSync(configFileMap[roomId], JSON.stringify(config, null, 2));
  log.info(`Created bot for room ${roomId}`);
  room.say("已为该群创建机器人");
};

/** 更新当前 bot 群的群成员 Refresh room members */
export async function refreshRoom(room: Room) {
  const { serviceListMap, configFileMap } = loadBotsConfig();
  const roomId = room.id;
  let members = await room.memberAll();
  const membersIds = members.map((member) => member.id);
  const botId = serviceListMap[roomId];
  if (botId) {
    const config = JSON.parse(fs.readFileSync(configFileMap[botId], "utf-8"));
    config.service_list = Array.from(new Set([...membersIds]));
    fs.writeFileSync(configFileMap[botId], JSON.stringify(config, null, 2));
    room.say("已刷新群成员");
    log.info(`Refreshed members of ${roomId} for bot ${botId}`);
  }
}

/** 停用 群bot */
export async function stopRoomBot(room: Room) {
  const roomId = room.id;
  /** 如果该文件存在 */
  if (fs.existsSync(path.join(configFolderPath, `${roomId}.json`))) {
    fs.unlinkSync(path.join(configFolderPath, `${roomId}.json`));
    room.say(
      "已将该群从所有学习源中取消，同时该群以及所有成员从服务清单中移除，对应的 bot 也已解除关联"
    );
  } else {
    log.info(`Bot for room ${roomId} does not exist`);
    room.say("该群不存在机器人");
  }
}

/** 获取权限用户列表 */
export const getPermissionUsers = (id?: number | string) => {
  const directors = loadDirectors();
  const { serviceUserList } = loadBotsConfig();

  const userInfo = {
    users: serviceUserList || [],
    permission: id
      ? serviceUserList.includes(id) || directors.includes(id as string)
      : false,
  };
  return userInfo;
};

/** 获取权限群 */
export const getPermissionRoom = (id?: number | string) => {
  const { botsList } = loadBotsConfig();

  const userInfo = {
    rooms: botsList || [],
    permission: id ? botsList.includes(id) : false,
  };
  return userInfo;
};

/**  */

interface Config {
  learn_sources: string[];
  [key: string]: any;
}

interface ResponseMessage {
  type: string;
  answer: string;
}

declare function aio_config_load(path: string): Promise<Config | null>;
declare function aio_save_config(config: Config, path: string): Promise<void>;

export async function addSourceTo(
  room_id: string,
  bot_id: string
): Promise<ResponseMessage[]> {
  const { configFileMap, learnSourcesMap } = loadBotsConfig();
  // 检查机器人配置文件是否存在
  if (!(bot_id in configFileMap)) {
    return  [
      {
        type: "text",
        answer: `未找到对应 ${bot_id} 的机器人配置文件，请先创建该机器人配置文件，再添加学习源`,
      },
    ];
  }

  // 检查聊天室是否已被其他机器人添加为学习源
  if (room_id in learnSourcesMap && learnSourcesMap[room_id] !== bot_id) {
    return [
      {
        type: "text",
        answer: `${room_id} 已经被 ${learnSourcesMap[room_id]} 添加为学习源，无法再次添加`,
      },
    ];
  }

  // 检查聊天室是否已被当前机器人添加为学习源
  if (room_id in learnSourcesMap && learnSourcesMap[room_id] === bot_id) {
    return [
      {
        type: "text",
        answer: `${room_id} 已经被 ${bot_id} 添加为学习源，无需重复添加`,
      },
    ];
  }

  // 加载机器人配置
  const config = await aio_config_load(configFileMap[bot_id]);
  if (!config) {
    return [
      {
        type: "text",
        answer: `智能体 ${bot_id} 配置文件异常，请检查后再操作`,
      },
    ];
  }

  // 更新配置
  config.learn_sources.push(room_id);

  // 使用锁确保并发安全
  learnSourcesMap[room_id] = bot_id;

  if (configFileMap[bot_id] && configFileMap[bot_id].endsWith(".json")) {
    await aio_save_config(config, configFileMap[bot_id]);
    fs.writeFileSync(configFileMap[bot_id], JSON.stringify(config, null, 2));
  } else {
    return;
  }

  return [
    {
      type: "text",
      answer: `已为 ${room_id} 添加到 ${bot_id} 的学习源，${bot_id} 将会主动学习该群聊信息`,
    },
  ];
}

/** 更新room_users */
// export const updateRoomUsers = async (
//   room: Room,
//   type: "update" | "clear" | "add" | "delete"
// ) => {
//   let alias = [];
//   const roomConfig = getRoomUserJSON() || [];
//   const allAlias = await room.memberAll();

//   if (type === "update") {
//     alias = await Promise.all(
//       allAlias.map((ali) => {
//         return (async () => {
//           const roomAlias = (await room.alias(ali)) || "";
//           return { ...ali?.payload, roomAlias: roomAlias };
//         })();
//       })
//     );
//   } else if (type === "clear") {
//     alias = [];
//   }
//   const newConfig = { room: room.payload, users: alias };

//   let newRoomConfig = [];
//   if (type === "delete") {
//     newRoomConfig = roomConfig?.filter((r) => r.room.id !== room.id);
//   } else {
//     let index = -1;
//     newRoomConfig = roomConfig?.map((r, i) => {
//       if (r.room.id === room.id) {
//         index = i;
//         return newConfig;
//       }
//       return r;
//     });
//     if (index === -1) newRoomConfig.push(newConfig);
//   }

//   fs.writeFileSync(
//     `${WechatyuiPath}/room_users.json`,
//     JSON.stringify(newRoomConfig, null, "\t")
//   );
// };

/** 更新全局 config.json 配置 */
export const updateConfig = async (key: string, value: string) => {
  const res = fs.readFileSync(`${ConfigPath}/config.json`, "utf-8");
  const newConfig = JSON5.parse(res);
  newConfig[key] = value;

  fs.writeFileSync(
    `${ConfigPath}/config.json`,
    JSON.stringify(newConfig, null, "\t")
  );
};

/** 获取当前群没有备注的用户列表，默认取群内所有用户 */
export const getNoAliasUserId = async (
  room: Room,
  users?: Contact[]
): Promise<Contact[]> => {
  const allMember = users ? users : await room.memberAll();
  const noAlias = [];
  await Promise.all(
    allMember.map((m) => {
      return (async () => {
        const roomAlias = (await room.alias(m)) || "";
        if (!roomAlias && !m.self()) {
          noAlias.push(m);
        }
      })();
    })
  );
  return noAlias;
};
